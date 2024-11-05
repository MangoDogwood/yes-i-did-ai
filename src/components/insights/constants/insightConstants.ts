// src/components/insights/constants/insightConstants.ts

export const ANIMATION_VARIANTS = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };
  
  export const LOADING_STAGES = {
    ANALYZING: {
      message: 'Analyzing your tasks and patterns...',
      description: 'Examining your task history and completion patterns'
    },
    GENERATING: {
      message: 'Generating personalized insights...',
      description: 'Creating meaningful insights based on your work style'
    },
    PROCESSING: {
      message: 'Processing achievement data...',
      description: 'Calculating metrics and identifying achievements'
    },
    FINALIZING: {
      message: 'Preparing your insights dashboard...',
      description: 'Organizing information for optimal viewing'
    }
  } as const;
  
  export const RETRY_CONFIG = {
    MAX_RETRIES: 3,
    INITIAL_DELAY: 1000,
    BACKOFF_FACTOR: 1.5
  } as const;
  
  export const METRICS_CONFIG = {
    completionRate: {
      label: 'Completion Rate',
      color: 'blue',
      icon: 'CheckCircle'
    },
    productivityScore: {
      label: 'Productivity Score',
      color: 'green',
      icon: 'TrendingUp'
    },
    averageTimePerTask: {
      label: 'Avg Time per Task',
      color: 'purple',
      icon: 'Clock'
    }
  } as const;