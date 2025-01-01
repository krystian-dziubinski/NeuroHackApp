import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StatsScreen() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await AsyncStorage.getItem('testResults');
      if (data) {
        const tests = JSON.parse(data);
        const calculatedStats = calculateStats(tests);
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const calculateStats = (tests) => {
    if (!tests.length) return null;

    const emotions = ['happy', 'sad', 'anxious', 'calm'];
    const stats = {
      totalTests: tests.length,
      averageImprovement: {},
    };

    emotions.forEach(emotion => {
      let totalImprovement = 0;
      let validTests = 0;

      tests.forEach(test => {
        const pre = test[`pre_${emotion}`];
        const post = test[`post_${emotion}`];
        
        if (pre !== undefined && post !== undefined) {
          totalImprovement += (post - pre);
          validTests++;
        }
      });

      stats.averageImprovement[emotion] = validTests ? 
        (totalImprovement / validTests).toFixed(2) : 0;
    });

    return stats;
  };

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No test data available yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Progress</Text>
      <Text style={styles.subtitle}>Total Tests: {stats.totalTests}</Text>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Average Emotional Changes</Text>
        {Object.entries(stats.averageImprovement).map(([emotion, change]) => (
          <View key={emotion} style={styles.statRow}>
            <Text style={styles.emotionText}>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</Text>
            <Text style={[
              styles.changeText,
              parseFloat(change) > 0 ? styles.positive : 
              parseFloat(change) < 0 ? styles.negative : styles.neutral
            ]}>
              {change > 0 ? '+' : ''}{change}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.note}>
        Positive values indicate improvement in positive emotions or reduction in negative emotions.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  statsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  emotionText: {
    fontSize: 16,
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  neutral: {
    color: '#9E9E9E',
  },
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
