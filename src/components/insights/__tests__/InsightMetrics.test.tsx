import React from 'react';
import { render, screen } from '../../../test/utils';
import { InsightMetrics } from '../components/InsightMetrics';

const mockMetrics = {
  tasksCompleted: 10,
  completionRate: 75,
  productivityScore: 85,
  trendsData: {
    daily: [5, 7, 3, 8, 6, 9, 4],
    weekly: [25, 30, 28, 35],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  }
};

describe('InsightMetrics', () => {
  it('renders all metric values correctly', () => {
    render(<InsightMetrics metrics={mockMetrics} />);
    
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('85/100')).toBeInTheDocument();
  });

  it('renders trends chart when data is provided', () => {
    const { container } = render(<InsightMetrics metrics={mockMetrics} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('handles metrics without trends data', () => {
    const metricsWithoutTrends = {
      ...mockMetrics,
      trendsData: undefined
    };
    const { container } = render(<InsightMetrics metrics={metricsWithoutTrends} />);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes for styling', () => {
    render(<InsightMetrics metrics={mockMetrics} />);
    
    expect(screen.getByText('Tasks Completed').parentElement)
      .toHaveClass('bg-blue-50');
    expect(screen.getByText('Completion Rate').parentElement)
      .toHaveClass('bg-green-50');
    expect(screen.getByText('Productivity Score').parentElement)
      .toHaveClass('bg-purple-50');
  });
});