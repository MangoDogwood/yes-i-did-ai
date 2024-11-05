import { ProfileState } from '../store/profileSlice';

const PROFILE_STORAGE_KEY = 'userProfile';
const ONBOARDING_STATUS_KEY = 'hasCompletedOnboarding';

export const profileService = {
  saveProfile: (profile: ProfileState) => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  },

  loadProfile: (): ProfileState | null => {
    const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    return savedProfile ? JSON.parse(savedProfile) : null;
  },

  resetProfile: () => {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_STATUS_KEY);
  },

  hasCompletedOnboarding: (): boolean => {
    return localStorage.getItem(ONBOARDING_STATUS_KEY) === 'true';
  },

  setOnboardingComplete: () => {
    localStorage.setItem(ONBOARDING_STATUS_KEY, 'true');
  },
};

export default profileService;