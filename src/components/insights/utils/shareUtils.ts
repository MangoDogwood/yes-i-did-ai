// src/components/insights/utils/shareUtils.ts

import { DailyInsight } from '../types';
import { analytics } from '../../../utils/analytics';

export const shareInsights = async (insights: DailyInsight): Promise<void> => {
  try {
    const shareData = {
      title: 'Yes I Did AI - Insights',
      text: `Check out my productivity insights from ${insights.timestamp}!`,
      url: window.location.href
    };

    if (navigator.share) {
      await navigator.share(shareData);
      analytics.track('insights_shared', { method: 'native' });
    } else {
      // Fallback to clipboard
      const text = `
        Yes I Did AI Insights - ${insights.timestamp}
        ${insights.overview}
        
        Key Achievements:
        ${insights.keyAchievements.map(a => `- ${a.title}`).join('\n')}
        
        Focus Recommendation:
        ${insights.focusRecommendation}
      `.trim();

      await navigator.clipboard.writeText(text);
      analytics.track('insights_shared', { method: 'clipboard' });
    }
  } catch (error) {
    console.error('Error sharing insights:', error);
    throw new Error('Failed to share insights');
  }
};