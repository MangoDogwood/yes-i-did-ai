import React, { useState, useRef } from 'react';
import { Mic, Square, Play, RotateCcw, Check } from 'lucide-react';

interface VoiceRecorderProps {
    onTranscription: (text: string) => void;
    disabled?: boolean;
  }

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
    }
  };

  const submitRecording = async () => {
    if (audioBlob) {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      try {
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        onTranscription(data.text);
      } catch (error) {
        console.error('Error submitting audio:', error);
      }
    }
  };

  return (
    <div className="voice-recorder">
      {!audioBlob ? (
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          className={`record-button ${isRecording ? 'recording' : ''}`}
        >
          {isRecording ? <Square /> : <Mic />}
        </button>
      ) : (
        <div className="recording-controls">
          <button onClick={playRecording}><Play /></button>
          <button onClick={() => setAudioBlob(null)}><RotateCcw /></button>
          <button onClick={submitRecording}><Check /></button>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;