import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  name: string;
  workStyle: string;
  motivationFactors: string[];
  strengths: string[];
  currentGoals: string[];
}

const initialState: User = {
  name: 'User',
  workStyle: 'Not specified',
  motivationFactors: [],
  strengths: [],
  currentGoals: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateUser } = userSlice.actions;
export default userSlice.reducer;