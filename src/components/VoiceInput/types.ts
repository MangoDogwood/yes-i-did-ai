import { Dispatch, SetStateAction } from 'react';

export interface VoiceInputProps {
  onClose: () => void;
  onError: Dispatch<SetStateAction<string | null>>;
}