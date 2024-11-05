import React from 'react';
import { useSelector } from 'react-redux';
import { Lightbulb, AlertTriangle, Download, Share2 } from 'lucide-react';
import { BlobProvider } from '@react-pdf/renderer';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

// External components
import { ErrorBoundary } from '../common/ErrorBoundary';
import { Button } from '../ui/button';
import { RootState } from '../../store';

// Local hooks
import { useInsightGeneration } from './hooks/useInsightGeneration';

// Local components
import { InsightMetrics } from './components/InsightMetrics';
import { ProjectInsightCard } from './components/ProjectInsightCard';
import { AchievementList } from './components/AchievementList';
import { LoadingOverlay } from './components/LoadingOverlay';
import { InsightsPDF } from './components/InsightsPDF';

// Types and utilities
import { 
  DailyInsight, 
  ProjectInsight, 
  InsightState, 
  LoadingStage 
} from './types';
import { ANIMATION_VARIANTS } from './constants/insightConstants';
import { analytics } from '../../utils/analytics';
import { shareInsights } from './utils/shareUtils';

const animations: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

const InsightsTab: React.FC = () => {
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const { insights, loading, error, stage } = useSelector<RootState, InsightState>(
    (state: RootState) => state.insights
  );
  
  // Pass tasks directly to useInsightGeneration
  const { generateInsights } = useInsightGeneration(tasks);

  const handleAddTask = (task: string) => {
    console.log('Adding task:', task);
    analytics.track('Suggested Task Added', { task });
  };

  const handleShare = async () => {
    if (insights) {
      try {
        await shareInsights(insights);
        analytics.track('Insights Shared', { success: true });
      } catch (err) {
        analytics.track('Insights Share Failed', { error: err });
        console.error('Failed to share insights:', err);
      }
    }
  };

  const handleGenerateInsights = () => {
    analytics.track('Generate Insights Clicked');
    generateInsights();
  };

  const renderError = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={animations}
      className="p-4 bg-red-50 rounded-lg"
    >
      <div className="flex items-center gap-2 text-red-700">
        <AlertTriangle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    </motion.div>
  );

  const renderInsightsButton = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={animations}
      className="text-center py-8"
    >
      <Button
        onClick={handleGenerateInsights}
        className="flex items-center gap-2 px-6"
      >
        <Lightbulb className="w-5 h-5" />
        Generate Insights
      </Button>
    </motion.div>
  );

  const renderInsightsContent = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={animations}
      className="space-y-6"
    >
      <div className="flex justify-end gap-2">
        <BlobProvider document={<InsightsPDF insights={insights!} />}>
          {({ url }) => (
            <Button
              variant="outline"
              onClick={() => {
                analytics.track('PDF Export Clicked');
                window.open(url || '', '_blank');
              }}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          )}
        </BlobProvider>
        <Button
          onClick={handleShare}
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>

      {insights?.metrics && (
        <InsightMetrics metrics={insights.metrics} />
      )}

      {insights?.projectInsights && insights.projectInsights.map((project) => (
        <ProjectInsightCard 
          key={project.id}
          insight={project}
          onAddTask={handleAddTask}
          className="mb-4"
        />
      ))}

      {insights?.keyAchievements && (
        <AchievementList achievements={insights.keyAchievements} />
      )}
    </motion.div>
  );

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <div className="space-y-6 p-4">
          {loading && <LoadingOverlay stage={stage} />}
          {error && renderError()}
          {!loading && !insights && tasks.length > 0 && renderInsightsButton()}
          {insights && renderInsightsContent()}
        </div>
      </AnimatePresence>
    </ErrorBoundary>
  );
};

export default InsightsTab;