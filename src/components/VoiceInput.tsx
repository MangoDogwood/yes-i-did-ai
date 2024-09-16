import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTask } from '../store/tasksSlice';
import { Mic } from 'lucide-react';

const VoiceInput: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const dispatch = useDispatch();

  const startListening = () => {
    setIsListening(true);
    // Simulate voice recognition
    setTimeout(() => {
      const recognizedText = "Voice recorded task: Follow up on email inquiries";
      dispatch(addTask({
        id: Date.now(),
        text: recognizedText,
        completed: false,
        project: 'Inbox',
        priority: 'medium',
        summary: ''
      }));
      setIsListening(false);
    }, 3000);
  };

  return (
    <button
      onClick={startListening}
      disabled={isListening}
      className={`flex-1 ${isListening ? 'bg-red-500' : 'bg-green-500'} text-white px-4 py-2 rounded hover:bg-opacity-90 transition duration-200 flex items-center justify-center`}
    >
      <Mic size={20} className="mr-2" />
      {isListening ? 'Listening...' : 'Voice Input'}
    </button>
  );
};

export default VoiceInput;