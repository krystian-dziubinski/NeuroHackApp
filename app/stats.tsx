import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, BarChart } from 'react-native-chart-kit';

interface Stats {
  totalTests: number;
  averageImprovement: Record<string, string>;
  timeSeriesData: {
    labels: string[];
    positive: number[];
    negative: number[];
    overall: number[];
  };
}

export default function StatsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const { width } = useWindowDimensions();

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

  const calculateStats = (tests: any[]): Stats | null => {
    if (!tests.length) return null;

    const positiveEmotions = ['happy', 'calm'];
    const negativeEmotions = ['sad', 'anxious'];
    
    // Sort tests by timestamp
    const sortedTests = tests.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    const timeSeriesData = {
      labels: sortedTests.map(test => new Date(test.timestamp).toLocaleDateString()),
      positive: [],
      negative: [],
      overall: [],
    };

    // Calculate averages for each test
    sortedTests.forEach(test => {
      let positiveChange = 0;
      let negativeChange = 0;

      positiveEmotions.forEach(emotion => {
        const pre = test[`pre_${emotion}`] || 0;
        const post = test[`post_${emotion}`] || 0;
        positiveChange += post - pre;
      });

      negativeEmotions.forEach(emotion => {
        const pre = test[`pre_${emotion}`] || 0;
        const post = test[`post_${emotion}`] || 0;
        negativeChange += pre - post; // Inverted for negative emotions
      });

      const positiveAvg = positiveChange / positiveEmotions.length;
      const negativeAvg = negativeChange / negativeEmotions.length;
      
      timeSeriesData.positive.push(Number(positiveAvg.toFixed(2)));
      timeSeriesData.negative.push(Number(negativeAvg.toFixed(2)));
      timeSeriesData.overall.push(Number(((positiveAvg + negativeAvg) / 2).toFixed(2)));
    });

    // Calculate overall improvements
    const stats = {
      totalTests: tests.length,
      averageImprovement: {} as Record<string, string>,
      timeSeriesData,
    };

    [...positiveEmotions, ...negativeEmotions].forEach(emotion => {
      let totalImprovement = 0;
      let validTests = 0;

      tests.forEach(test => {
        const pre = test[`pre_${emotion}`];
        const post = test[`post_${emotion}`];
        
        if (pre !== undefined && post !== undefined) {
          totalImprovement += negativeEmotions.includes(emotion) ? 
            (pre - post) : // Inverted for negative emotions
            (post - pre);
          validTests++;
        }
      });

      stats.averageImprovement[emotion] = validTests ? 
        (totalImprovement / validTests).toFixed(2) : '0';
    });

    return stats;
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
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

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Emotion Changes Over Time</Text>
        <LineChart
          data={{
            labels: stats.timeSeriesData.labels,
            datasets: [
              {
                data: stats.timeSeriesData.positive,
                color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
                strokeWidth: 2,
              },
              {
                data: stats.timeSeriesData.negative,
                color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
                strokeWidth: 2,
              },
              {
                data: stats.timeSeriesData.overall,
                color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          }}
          width={width - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#2ecc71' }]} />
            <Text>Positive</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#e74c3c' }]} />
            <Text>Negative</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#3498db' }]} />
            <Text>Overall</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Average Improvements</Text>
        <BarChart
          data={{
            labels: Object.keys(stats.averageImprovement).map(key => 
              key.charAt(0).toUpperCase() + key.slice(1)
            ),
            datasets: [{
              data: Object.values(stats.averageImprovement).map(Number)
            }]
          }}
          width={width - 40}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => {
              return `rgba(52, 152, 219, ${opacity})`;
            },
          }}
          style={styles.chart}
          showValuesOnTopOfBars
        />
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
  chartContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
});
