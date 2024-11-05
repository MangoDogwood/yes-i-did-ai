import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Brain, 
  Clock, 
  Target, 
  Sparkles, 
  Calendar,
  CheckCircle,
  Coffee,
  Battery,
  Zap,
  Flag
} from 'lucide-react';
import { updateProfile, updatePreferences, updatePersona } from '../../store/profileSlice';

const ONBOARDING_STEPS = {
  WELCOME: 'welcome',
  BASICS: 'basics',
  WORK_STYLE: 'workStyle',
  PRODUCTIVITY: 'productivity',
  GOALS: 'goals',
  PREFERENCES: 'preferences',
  AI_PREFERENCES: 'aiPreferences',
  COMPLETE: 'complete'
} as const;

type OnboardingStep = typeof ONBOARDING_STEPS[keyof typeof ONBOARDING_STEPS];

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(ONBOARDING_STEPS.WELCOME);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    role: '',
    
    // Work Style
    workStyle: 'balanced' as const,
    learningStyle: 'mixed' as const,
    
    // Productivity
    preferredWorkingHours: {
      start: '09:00',
      end: '17:00'
    },
    focusTimePreference: 'morning' as const,
    energyPeaks: [] as string[],
    breakPreference: '30' as string,
    
    // Goals & Challenges
    primaryGoals: [] as string[],
    challengeAreas: [] as string[],
    
    // Preferences
    taskComplexityPreference: 'moderate' as const,
    notificationPreferences: {
      breakReminders: true,
      dailyDigest: true,
      achievementAlerts: true
    },
    
    // AI Preferences
    aiInteractionStyle: 'proactive' as 'proactive' | 'minimal' | 'balanced',
    aiSuggestionAreas: [] as string[]
  });

  useEffect(() => {
    // Calculate progress based on currentStep
    const steps = Object.values(ONBOARDING_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    setProgress((currentIndex / (steps.length - 1)) * 100);
  }, [currentStep]);

  const slideVariants = {
    enter: { x: 1000, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -1000, opacity: 0 }
  };

  const handleNext = () => {
    const steps = Object.values(ONBOARDING_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      // Save data based on current step
      switch (currentStep) {
        case ONBOARDING_STEPS.BASICS:
          dispatch(updateProfile({ 
            name: formData.name,
            email: formData.email
          }));
          break;
        case ONBOARDING_STEPS.WORK_STYLE:
          dispatch(updatePersona({
            workStyle: formData.workStyle,
            learningStyle: formData.learningStyle
          }));
          break;
        case ONBOARDING_STEPS.PRODUCTIVITY:
          dispatch(updatePreferences({
            preferredWorkingHours: formData.preferredWorkingHours,
            focusTimePreference: formData.focusTimePreference
          }));
          break;
      }
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Save final preferences
    dispatch(updateProfile({
      name: formData.name,
      email: formData.email
    }));
    dispatch(updatePersona({
      workStyle: formData.workStyle,
      learningStyle: formData.learningStyle,
      productivityPeaks: formData.energyPeaks,
      challengeAreas: formData.challengeAreas
    }));
    dispatch(updatePreferences({
      preferredWorkingHours: formData.preferredWorkingHours,
      focusTimePreference: formData.focusTimePreference,
      taskComplexityPreference: formData.taskComplexityPreference,
      breakReminders: formData.notificationPreferences.breakReminders
    }));

    onComplete();
  };

  const renderStep = () => {
    switch (currentStep) {
      case ONBOARDING_STEPS.WELCOME:
        return (
          <motion.div
            key="welcome"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="text-center space-y-6"
          >
            <Sparkles className="w-16 h-16 text-blue-500 mx-auto" />
            <h1 className="text-3xl font-bold">Welcome to Yes I Did AI</h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Let's personalize your experience to help you achieve more. 
              This will take about 2 minutes.
            </p>
            <button
              onClick={() => setCurrentStep(ONBOARDING_STEPS.BASICS)}
              className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              Let's Get Started
            </button>
          </motion.div>
        );

      case ONBOARDING_STEPS.BASICS:
        return (
          <motion.div
            key="basics"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <User className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">First, tell us about yourself</h2>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What's your name?
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What best describes your role?
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a role</option>
                  <option value="developer">Developer</option>
                  <option value="designer">Designer</option>
                  <option value="manager">Manager</option>
                  <option value="entrepreneur">Entrepreneur</option>
                  <option value="student">Student</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </motion.div>
        );

      case ONBOARDING_STEPS.WORK_STYLE:
        return (
          <motion.div
            key="workStyle"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Your Work Style</h2>
              <p className="text-gray-600">Help us understand how you work best</p>
            </div>
            <div className="space-y-6 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How do you prefer to work?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'methodical', label: 'Methodical', icon: CheckCircle },
                    { value: 'flexible', label: 'Flexible', icon: Zap },
                    { value: 'deadline-driven', label: 'Deadline-Driven', icon: Flag },
                    { value: 'balanced', label: 'Balanced', icon: Battery }
                  ].map(style => (
                    <button
                      key={style.value}
                      onClick={() => setFormData({ ...formData, workStyle: style.value as any })}
                      className={`p-4 border rounded-lg text-center transition-colors ${
                        formData.workStyle === style.value 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <style.icon className="w-6 h-6 mx-auto mb-2" />
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How do you learn best?
                </label>
                <select
                  value={formData.learningStyle}
                  onChange={(e) => setFormData({ ...formData, learningStyle: e.target.value as any })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="visual">Visual - Through diagrams and demonstrations</option>
                  <option value="practical">Practical - By doing and experimenting</option>
                  <option value="theoretical">Theoretical - Through concepts and analysis</option>
                  <option value="mixed">Mixed - A combination of methods</option>
                </select>
              </div>
            </div>
          </motion.div>
        );

      case ONBOARDING_STEPS.PRODUCTIVITY:
        return (
          <motion.div
            key="productivity"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Your Productivity Pattern</h2>
            </div>
            <div className="space-y-6 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  When are you most productive?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    'Early Morning',
                    'Late Morning',
                    'Early Afternoon',
                    'Late Afternoon',
                    'Evening',
                    'Late Night'
                  ].map(time => (
                    <button
                      key={time}
                      onClick={() => {
                        const peaks = formData.energyPeaks.includes(time)
                          ? formData.energyPeaks.filter(t => t !== time)
                          : [...formData.energyPeaks, time];
                        setFormData({ ...formData, energyPeaks: peaks });
                      }}
                      className={`p-2 border rounded-lg text-center transition-colors ${
                        formData.energyPeaks.includes(time)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.preferredWorkingHours.start}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferredWorkingHours: {
                        ...formData.preferredWorkingHours,
                        start: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.preferredWorkingHours.end}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferredWorkingHours: {
                        ...formData.preferredWorkingHours,
                        end: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case ONBOARDING_STEPS.GOALS:
        return (
          <motion.div
            key="goals"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Target className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Goals & Challenges</h2>
            </div>
            <div className="space-y-6 max-w-md mx-auto">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                  What are your primary goals? (Select up to 3)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'productivity', label: 'Increase Productivity' },
                    { value: 'organization', label: 'Better Organization' },
                    { value: 'work-life', label: 'Work-Life Balance' },
                    { value: 'focus', label: 'Improve Focus' },
                    { value: 'stress', label: 'Reduce Stress' },
                    { value: 'growth', label: 'Professional Growth' }
                  ].map(goal => (
                    <button
                      key={goal.value}
                      onClick={() => {
                        const goals = formData.primaryGoals.includes(goal.value)
                          ? formData.primaryGoals.filter(g => g !== goal.value)
                          : formData.primaryGoals.length < 3
                          ? [...formData.primaryGoals, goal.value]
                          : formData.primaryGoals;
                        setFormData({ ...formData, primaryGoals: goals });
                      }}
                      disabled={!formData.primaryGoals.includes(goal.value) && formData.primaryGoals.length >= 3}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        formData.primaryGoals.includes(goal.value)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-200'
                      } ${
                        !formData.primaryGoals.includes(goal.value) && formData.primaryGoals.length >= 3
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      {goal.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What challenges would you like to overcome?
                </label>
                <div className="space-y-2">
                  {[
                    'Procrastination',
                    'Time Management',
                    'Task Prioritization',
                    'Meeting Deadlines',
                    'Maintaining Focus',
                    'Information Overload'
                  ].map(challenge => (
                    <label
                      key={challenge}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.challengeAreas.includes(challenge)}
                        onChange={() => {
                          const challenges = formData.challengeAreas.includes(challenge)
                            ? formData.challengeAreas.filter(c => c !== challenge)
                            : [...formData.challengeAreas, challenge];
                          setFormData({ ...formData, challengeAreas: challenges });
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{challenge}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case ONBOARDING_STEPS.AI_PREFERENCES:
        return (
          <motion.div
            key="aiPreferences"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">AI Assistance Preferences</h2>
              <p className="text-gray-600">Let's customize how AI helps you</p>
            </div>
            <div className="space-y-6 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you like AI to assist you?
                </label>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    {
                      value: 'proactive',
                      label: 'Proactive',
                      description: 'AI actively suggests improvements and optimizations'
                    },
                    {
                      value: 'balanced',
                      label: 'Balanced',
                      description: 'A mix of proactive and on-demand assistance'
                    },
                    {
                      value: 'minimal',
                      label: 'Minimal',
                      description: 'AI helps only when explicitly requested'
                    }
                  ].map(style => (
                    <button
                      key={style.value}
                      onClick={() => setFormData({ ...formData, aiInteractionStyle: style.value as any })}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        formData.aiInteractionStyle === style.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <div className="font-medium">{style.label}</div>
                      <div className="text-sm text-gray-600">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Areas where you'd like AI suggestions
                </label>
                <div className="space-y-2">
                  {[
                    'Task Prioritization',
                    'Time Management Tips',
                    'Focus Improvements',
                    'Work-Life Balance',
                    'Meeting Preparation',
                    'Learning Opportunities'
                  ].map(area => (
                    <label
                      key={area}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.aiSuggestionAreas.includes(area)}
                        onChange={() => {
                          const areas = formData.aiSuggestionAreas.includes(area)
                            ? formData.aiSuggestionAreas.filter(a => a !== area)
                            : [...formData.aiSuggestionAreas, area];
                          setFormData({ ...formData, aiSuggestionAreas: areas });
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case ONBOARDING_STEPS.COMPLETE:
        return (
          <motion.div
            key="complete"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="text-center space-y-6"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-3xl font-bold">All Set!</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Your personalized workspace is ready. Let's start achieving your goals together!
            </p>
            <button
              onClick={handleComplete}
              className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              Get Started
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200">
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      {currentStep !== ONBOARDING_STEPS.WELCOME && 
       currentStep !== ONBOARDING_STEPS.COMPLETE && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t">
          <div className="max-w-2xl mx-auto flex justify-between">
            <button
              onClick={() => {
                const steps = Object.values(ONBOARDING_STEPS);
                const currentIndex = steps.indexOf(currentStep);
                setCurrentStep(steps[currentIndex - 1]);
              }}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;