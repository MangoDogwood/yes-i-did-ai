// src/components/insights/components/InsightsPDF.tsx

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { DailyInsight, Achievement, ProjectInsight } from '../../../types';

interface InsightsPDFProps {
  insights: DailyInsight;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF'
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333333'
  },
  subsectionTitle: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666666'
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    color: '#444444'
  },
  tag: {
    fontSize: 10,
    color: '#666666',
    marginRight: 5
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  metricBox: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#F3F4F6'
  }
});

export const InsightsPDF: React.FC<InsightsPDFProps> = ({ insights }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.title}>Insights Report</Text>
        <Text style={styles.text}>{new Date(insights.timestamp).toLocaleDateString()}</Text>

        {/* Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.text}>{insights.overview}</Text>
        </View>

        {/* Metrics */}
        {insights.metrics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Metrics</Text>
            <View style={styles.metrics}>
              <View style={styles.metricBox}>
                <Text style={styles.text}>
                  Tasks Completed: {insights.metrics.tasksCompleted}
                </Text>
                <Text style={styles.text}>
                  Completion Rate: {insights.metrics.completionRate}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Achievements</Text>
          {insights.keyAchievements.map((achievement, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.subsectionTitle}>{achievement.title}</Text>
              <Text style={styles.text}>{achievement.description}</Text>
              {achievement.impact && (
                <Text style={styles.text}>Impact: {achievement.impact}</Text>
              )}
              {achievement.tags && achievement.tags.length > 0 && (
                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                  {achievement.tags.map((tag, tagIndex) => (
                    <Text key={tagIndex} style={styles.tag}>#{tag}</Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Project Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Insights</Text>
          {insights.projectInsights.map((project, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.subsectionTitle}>{project.projectName}</Text>
              <Text style={styles.text}>Progress: {project.progress}</Text>
              <Text style={styles.text}>Analysis: {project.analysis}</Text>
            </View>
          ))}
        </View>

        {/* Focus Recommendation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Focus Recommendation</Text>
          <Text style={styles.text}>{insights.focusRecommendation}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InsightsPDF;