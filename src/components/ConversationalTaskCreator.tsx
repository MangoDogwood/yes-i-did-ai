import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addTask } from '../store/tasksSlice';
import VoiceRecorder from './VoiceRecorder';
import { getClaudeAnalysis } from '../utils/claudeApiClient';
import { Loader } from 'lucide-react';
import '../styles/ConversationalTaskCreator.css';

const ConversationalTaskCreator: React.FC = () => {
  const [conversation, setConversation] = useState<{role: 'ai' | 'user', content: string}[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    initiateConversation();
  }, []);

  const initiateConversation = async () => {
    setIsLoading(true);
    try {
      const initialPrompt = "Hello! I'm here to help you plan your tasks. How has your day been so far?";
      const aiResponse = await getClaudeAnalysis(initialPrompt);
      setConversation([{ role: 'ai', content: aiResponse }]);
    } catch (error) {
      setError("Failed to start conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserInput = async (input: string) => {
    setConversation(prev => [...prev, { role: 'user', content: input }]);
    setCurrentResponse('');
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await getClaudeAnalysis(generatePrompt(input));
      setConversation(prev => [...prev, { role: 'ai', content: aiResponse }]);

      if (aiResponse.includes("CREATE_TASK:")) {
        const taskDetails = extractTaskDetails(aiResponse);
        dispatch(addTask(taskDetails));
      }
    } catch (error) {
      setError("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePrompt = (userInput: string): string => {
    const conversationHistory = conversation.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n');
    return `${conversationHistory}\nUSER: ${userInput}\nAI: Based on this conversation, provide a helpful response. If the user mentions a task or something they need to do, respond with "CREATE_TASK:" followed by the task details in JSON format. Otherwise, continue the conversation naturally, asking about their day, plans, or any challenges they're facing.`;
  };

  const extractTaskDetails = (aiResponse: string): any => {
    const taskJson = aiResponse.split("CREATE_TASK:")[1].trim();
    return JSON.parse(taskJson);
  };

  const handleVoiceInput = (transcribedText: string) => {
    handleUserInput(transcribedText);
  };

  return (
    <div className="conversational-task-creator">
      <div className="conversation-history">
        {conversation.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="message ai">
            <Loader className="animate-spin" />
          </div>
        )}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={currentResponse}
          onChange={(e) => setCurrentResponse(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              handleUserInput(currentResponse);
            }
          }}
          placeholder="Type your response..."
          disabled={isLoading}
        />
<VoiceRecorder 
  onTranscription={(text) => handleUserInput(text)} 
  disabled={isLoading} 
/>
      </div>
    </div>
  );
};

export default ConversationalTaskCreator;