import { Task } from '../store/tasksSlice';

export interface AIInsight {
  type: 'prioritization' | 'timeEstimation' | 'productivity' | 'similarity' | 'recommendation';
  content: string;
}

export function generateAIInsights(tasks: Task[]): AIInsight[] {
  const insights: AIInsight[] = [];

  insights.push(prioritizeTasks(tasks));
  insights.push(estimateTaskTime(tasks));
  insights.push(analyzeProductivity(tasks));
  insights.push(findSimilarTasks(tasks));
  insights.push(generateRecommendation(tasks));

  return insights;
}

function prioritizeTasks(tasks: Task[]): AIInsight {
  const incompleteTasks = tasks.filter(task => !task.completed);
  const prioritizedTasks = incompleteTasks.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const topTasks = prioritizedTasks.slice(0, 3);
  const content = `Top 3 tasks to focus on:\n${topTasks.map(task => `- ${task.text} (${task.priority} priority)`).join('\n')}`;

  return { type: 'prioritization', content };
}

function estimateTaskTime(tasks: Task[]): AIInsight {
  // This is a simple estimation. In a real-world scenario, you'd use machine learning for more accurate estimates.
  const incompleteTasks = tasks.filter(task => !task.completed);
  const totalEstimatedTime = incompleteTasks.reduce((total, task) => {
    const baseTime = task.text.split(' ').length * 5; // 5 minutes per word as a very rough estimate
    const priorityMultiplier = { high: 1.5, medium: 1, low: 0.5 };
    return total + baseTime * priorityMultiplier[task.priority];
  }, 0);

  const content = `Estimated time to complete all tasks: ${Math.round(totalEstimatedTime / 60)} hours`;
  return { type: 'timeEstimation', content };
}

function analyzeProductivity(tasks: Task[]): AIInsight {
  const completedTasks = tasks.filter(task => task.completed);
  const completionRate = (completedTasks.length / tasks.length) * 100;

  let content = `Your task completion rate is ${completionRate.toFixed(2)}%.\n`;
  if (completionRate > 75) {
    content += "Great job! You're being very productive.";
  } else if (completionRate > 50) {
    content += "You're doing well, but there's room for improvement.";
  } else {
    content += "Consider breaking down your tasks into smaller, more manageable pieces.";
  }

  return { type: 'productivity', content };
}

function findSimilarTasks(tasks: Task[]): AIInsight {
  // This is a simple similarity check. In a real-world scenario, you'd use more advanced NLP techniques.
  const similarTasks: { [key: string]: string[] } = {};

  tasks.forEach(task => {
    const words = task.text.toLowerCase().split(' ');
    words.forEach(word => {
      if (word.length > 3) {  // Only consider words longer than 3 characters
        if (!similarTasks[word]) {
          similarTasks[word] = [];
        }
        similarTasks[word].push(task.text);
      }
    });
  });

  const similarGroups = Object.values(similarTasks).filter(group => group.length > 1);
  const content = similarGroups.length > 0
    ? `Found ${similarGroups.length} groups of similar tasks. Consider grouping these for efficiency.`
    : "No significantly similar tasks found.";

  return { type: 'similarity', content };
}

function generateRecommendation(tasks: Task[]): AIInsight {
  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  let content = "";

  if (incompleteTasks.length > completedTasks.length) {
    content = "You have more incomplete tasks than completed ones. Try to focus on completing some quick wins to build momentum.";
  } else if (incompleteTasks.length === 0) {
    content = "Great job completing all your tasks! Why not set some new goals?";
  } else {
    const highPriorityTasks = incompleteTasks.filter(task => task.priority === 'high');
    if (highPriorityTasks.length > 0) {
      content = `You have ${highPriorityTasks.length} high priority tasks. Consider tackling these first to make significant progress.`;
    } else {
      content = "You're making good progress. Keep up the good work and remember to take breaks!";
    }
  }

  return { type: 'recommendation', content };
}