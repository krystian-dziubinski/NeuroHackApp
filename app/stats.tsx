import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, useWindowDimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Stats {
  totalTests: number;
  averageImprovement: Record<string, string>;
  timeSeriesData: {
    labels: string[];
    positive: number[];
    negative: number[];
    overall: number[];
    emotions: {
      happy: number[];
      calm: number[];
      sad: number[];
      anxious: number[];
    };
  };
}

type Emotion = 'happy' | 'calm' | 'sad' | 'anxious';

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

    const positiveEmotions: Emotion[] = ['happy', 'calm'];
    const negativeEmotions: Emotion[] = ['sad', 'anxious'];
    const emotions: Emotion[] = ['happy', 'calm', 'sad', 'anxious'];
    
    // Sort tests by timestamp
    const sortedTests = tests.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Format dates in a more readable way
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      // If test is from today, show "Today"
      if (date.toDateString() === new Date().toDateString()) {
        return 'Today';
      }
      // If test is from yesterday, show "Yesterday"
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      // For other dates within the last week, show day name
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      if (date > weekAgo) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }
      // For older dates, show month and day
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    const timeSeriesData = {
      labels: sortedTests.map(test => formatDate(test.timestamp)),
      positive: [],
      negative: [],
      overall: [],
      emotions: {
        happy: [],
        calm: [],
        sad: [],
        anxious: [],
      },
    };

    // Calculate averages for each test
    sortedTests.forEach(test => {
      let positiveChange = 0;
      let negativeChange = 0;

      emotions.forEach(emotion => {
        const pre = test[`pre_${emotion}`] || 0;
        const post = test[`post_${emotion}`] || 0;
        const change = ['sad', 'anxious'].includes(emotion) ? 
          (pre - post) : // Inverted for negative emotions
          (post - pre);
        timeSeriesData.emotions[emotion].push(Number(change.toFixed(2)));
      });

      positiveEmotions.forEach(emotion => {
        const pre = test[`pre_${emotion}`] || 0;
        const post = test[`post_${emotion}`] || 0;
        positiveChange += post - pre;
      });

      negativeEmotions.forEach(emotion => {
        const pre = test[`pre_${emotion}`] || 0;
        const post = test[`post_${emotion}`] || 0;
        negativeChange += pre - post;
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
        <LinearGradient
          colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.replace('/')}
              >
                <Ionicons name="chevron-back" size={32} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
              <View style={styles.content}>
                <Text style={styles.message}>No test data available yet.</Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.replace('/')}
            >
              <Ionicons name="chevron-back" size={32} color="white" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.content}>
              <Text style={styles.title}>Results</Text>
              <Text style={styles.subtitle}>Total Tests: {stats?.totalTests || 0}</Text>

              {stats?.timeSeriesData && (
                <>
                  <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Emotion Changes Over Time</Text>
                    <LineChart
                      data={{
                        labels: stats.timeSeriesData.labels || [],
                        datasets: [
                          {
                            data: stats.timeSeriesData.positive || [],
                            color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
                            strokeWidth: 2,
                          },
                          {
                            data: stats.timeSeriesData.negative || [],
                            color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
                            strokeWidth: 2,
                          },
                          {
                            data: stats.timeSeriesData.overall || [],
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
                        <Text style={styles.legendText}>Positive</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: '#e74c3c' }]} />
                        <Text style={styles.legendText}>Negative</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: '#3498db' }]} />
                        <Text style={styles.legendText}>Overall</Text>
                      </View>
                    </View>
                  </View>

                  {stats.timeSeriesData.emotions && Object.entries(stats.timeSeriesData.emotions).map(([emotion, data]) => (
                    <View key={emotion} style={styles.chartContainer}>
                      <Text style={styles.chartTitle}>
                        {emotion.charAt(0).toUpperCase() + emotion.slice(1)} Changes
                      </Text>
                      <LineChart
                        data={{
                          labels: stats.timeSeriesData.labels || [],
                          datasets: [
                            {
                              data: data || [],
                              color: (opacity = 1) => {
                                const colors = {
                                  happy: `rgba(241, 196, 15, ${opacity})`,  // #f1c40f
                                  calm: `rgba(39, 174, 96, ${opacity})`,    // #27ae60
                                  sad: `rgba(142, 68, 173, ${opacity})`,    // #8e44ad
                                  anxious: `rgba(230, 126, 34, ${opacity})`, // #e67e22
                                };
                                return colors[emotion as keyof typeof colors];
                              },
                              strokeWidth: 2,
                            },
                          ],
                        }}
                        width={width - 40}
                        height={180}
                        chartConfig={{
                          ...chartConfig,
                          color: (opacity = 1) => {
                            const colors = {
                              happy: `rgba(241, 196, 15, ${opacity})`,  // #f1c40f
                              calm: `rgba(39, 174, 96, ${opacity})`,    // #27ae60
                              sad: `rgba(142, 68, 173, ${opacity})`,    // #8e44ad
                              anxious: `rgba(230, 126, 34, ${opacity})`, // #e67e22
                            };
                            return colors[emotion as keyof typeof colors];
                          },
                        }}
                        bezier
                        style={styles.chart}
                      />
                    </View>
                  ))}
                </>
              )}

              <View style={styles.statsContainer}>
                <Text style={styles.sectionTitle}>Average Improvements</Text>
                <BarChart
                  data={{
                    labels: Object.keys(stats.averageImprovement || {}).map(key => 
                      key.charAt(0).toUpperCase() + key.slice(1)
                    ),
                    datasets: [{
                      data: Object.values(stats.averageImprovement || {}).map(Number)
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
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    height: 60,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
  },
  message: {
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 10,
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
  legendText: {
    color: '#ffffff',
    fontSize: 12,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  note: {
    fontSize: 14,
    color: '#ffffff',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
