import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProfileState {
  id?: string;
  name: string;
  email: string;
  dateJoined: string;
  primaryGoals: string[];
  persona: {
    workStyle: string;
    strengths: string[];
    challengeAreas: string[];
    learningStyle: string;
    productivityPeaks?: string[]; // Added this field
  };
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    weekStartsOn: 0 | 1 | 6; // 0 = Sunday, 1 = Monday, 6 = Saturday
    preferredWorkingHours: {
      start: string;
      end: string;
    };
    focusTimePreference: 'morning' | 'afternoon' | 'evening';
    taskComplexityPreference: 'simple' | 'moderate' | 'complex';
    breakReminders: boolean;
  };
  stats: {
    totalTasksCompleted: number;
    averageTasksPerDay: number;
    completionRateByPriority: {
      high: number;
      medium: number;
      low: number;
    };
  };
}

const initialState: ProfileState = {
  name: '',
  email: '',
  dateJoined: new Date().toISOString(),
  primaryGoals: [],
  persona: {
    workStyle: '',
    strengths: [],
    challengeAreas: [],
    learningStyle: 'visual',
    productivityPeaks: [] // Added initial value
  },
  preferences: {
    theme: 'light',
    notifications: true,
    weekStartsOn: 1,
    preferredWorkingHours: {
      start: '09:00',
      end: '17:00'
    },
    focusTimePreference: 'morning',
    taskComplexityPreference: 'moderate',
    breakReminders: true
  },
  stats: {
    totalTasksCompleted: 0,
    averageTasksPerDay: 0,
    completionRateByPriority: {
      high: 0,
      medium: 0,
      low: 0
    }
  }
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Partial<ProfileState>>) => {
      return { ...state, ...action.payload };
    },
    updatePreferences: (state, action: PayloadAction<Partial<ProfileState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    updatePersona: (state, action: PayloadAction<Partial<ProfileState['persona']>>) => {
      state.persona = { ...state.persona, ...action.payload };
    },
    resetProfile: (state) => {
      return initialState;
    },
    updateStats: (state, action: PayloadAction<Partial<ProfileState['stats']>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    updateProductivityPeaks: (state, action: PayloadAction<string[]>) => {
      state.persona.productivityPeaks = action.payload;
    }
  }
});

export const { 
  updateProfile, 
  updatePreferences, 
  updatePersona, 
  resetProfile,
  updateStats,
  updateProductivityPeaks
} = profileSlice.actions;

export default profileSlice.reducer;