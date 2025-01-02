import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, useWindowDimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Stats {
  totalTests: number;
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

type TimeFilter = 'day' | 'week' | 'month' | 'year';

interface TestData {
  timestamp: number;
  emotions: {
    happy: number;
    calm: number;
    sad: number;
    anxious: number;
  };
  pre: {
    happy: number;
    calm: number;
    sad: number;
    anxious: number;
  };
  post: {
    happy: number;
    calm: number;
    sad: number;
    anxious: number;
  };
}

const aggregateData = (data: TestData[], filter: TimeFilter) => {
  const now = new Date();
  let filteredData: TestData[] = [];
  let aggregationPeriod = 1; // in days

  switch (filter) {
    case 'day':
      // Only today's data
      filteredData = data.filter(item => {
        const date = new Date(item.timestamp);
        return date.toDateString() === now.toDateString();
      });
      break;
    case 'week':
      // Last 7 days, aggregate by day
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredData = data.filter(item => new Date(item.timestamp) >= weekAgo);
      aggregationPeriod = 1;
      break;
    case 'month':
      // Last 31 days, aggregate by 3 days
      const monthAgo = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);
      filteredData = data.filter(item => new Date(item.timestamp) >= monthAgo);
      aggregationPeriod = 3;
      break;
    case 'year':
      // Last 365 days, aggregate by month
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      filteredData = data.filter(item => new Date(item.timestamp) >= yearAgo);
      aggregationPeriod = 30;
      break;
  }

  if (filter === 'day') return filteredData;

  // Group data by aggregation period
  const groupedData: { [key: string]: TestData[] } = {};
  filteredData.forEach(item => {
    const date = new Date(item.timestamp);
    const periodKey = Math.floor(date.getTime() / (aggregationPeriod * 24 * 60 * 60 * 1000));
    if (!groupedData[periodKey]) groupedData[periodKey] = [];
    groupedData[periodKey].push(item);
  });

  // Aggregate data for each period
  return Object.entries(groupedData).map(([key, items]) => {
    const avgEmotions: { happy: number; calm: number; sad: number; anxious: number } = {
      happy: 0,
      calm: 0,
      sad: 0,
      anxious: 0,
    };
    const avgPre: { happy: number; calm: number; sad: number; anxious: number } = {
      happy: 0,
      calm: 0,
      sad: 0,
      anxious: 0,
    };
    const avgPost: { happy: number; calm: number; sad: number; anxious: number } = {
      happy: 0,
      calm: 0,
      sad: 0,
      anxious: 0,
    };

    items.forEach(item => {
      avgEmotions.happy += item.emotions.happy / items.length;
      avgEmotions.calm += item.emotions.calm / items.length;
      avgEmotions.sad += item.emotions.sad / items.length;
      avgEmotions.anxious += item.emotions.anxious / items.length;
      avgPre.happy += item.pre.happy / items.length;
      avgPre.calm += item.pre.calm / items.length;
      avgPre.sad += item.pre.sad / items.length;
      avgPre.anxious += item.pre.anxious / items.length;
      avgPost.happy += item.post.happy / items.length;
      avgPost.calm += item.post.calm / items.length;
      avgPost.sad += item.post.sad / items.length;
      avgPost.anxious += item.post.anxious / items.length;
    });

    return {
      timestamp: Number(key) * aggregationPeriod * 24 * 60 * 60 * 1000,
      emotions: avgEmotions,
      pre: avgPre,
      post: avgPost,
    };
  });
};

const formatDate = (timestamp: number, filter: TimeFilter) => {
  const date = new Date(timestamp);
  switch (filter) {
    case 'day':
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case 'week':
      return date.toLocaleDateString([], { weekday: 'short' });
    case 'month':
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    case 'year':
      return date.toLocaleDateString([], { month: 'short' });
  }
};

export default function StatsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const { width } = useWindowDimensions();

  useEffect(() => {
    loadStats();
  }, [timeFilter]);

  const loadStats = async () => {
    try {
      const testsString = await AsyncStorage.getItem('tests');
      if (!testsString) {
        setStats(null);
        return;
      }

      const tests: TestData[] = JSON.parse(testsString);
      if (!Array.isArray(tests) || tests.length === 0) {
        setStats(null);
        return;
      }

      const aggregatedData = aggregateData(tests, timeFilter);
      if (aggregatedData.length === 0) {
        setStats(null);
        return;
      }

      // Process aggregated data for charts
      const timeSeriesData = {
        labels: aggregatedData.map(item => formatDate(item.timestamp, timeFilter)),
        positive: aggregatedData.map(item => {
          const happy = item.emotions.happy || 0;
          const calm = item.emotions.calm || 0;
          return happy + calm;
        }),
        negative: aggregatedData.map(item => {
          const sad = item.emotions.sad || 0;
          const anxious = item.emotions.anxious || 0;
          return -(sad + anxious);
        }),
        overall: aggregatedData.map(item => {
          const happy = item.emotions.happy || 0;
          const calm = item.emotions.calm || 0;
          const sad = item.emotions.sad || 0;
          const anxious = item.emotions.anxious || 0;
          return (happy + calm) - (sad + anxious);
        }),
        emotions: {
          happy: aggregatedData.map(item => item.emotions.happy || 0),
          calm: aggregatedData.map(item => item.emotions.calm || 0),
          sad: aggregatedData.map(item => item.emotions.sad || 0),
          anxious: aggregatedData.map(item => item.emotions.anxious || 0),
        }
      };

      setStats({
        totalTests: tests.length,
        timeSeriesData,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(null);
    }
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
            <View style={styles.content}>
              <Text style={styles.message}>No test data available yet.</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  const TimeFilterButton = ({ filter, label }: { filter: TimeFilter; label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        timeFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setTimeFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        timeFilter === filter && styles.filterButtonTextActive,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

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

              <View style={styles.filterContainer}>
                <TimeFilterButton filter="day" label="Day" />
                <TimeFilterButton filter="week" label="Week" />
                <TimeFilterButton filter="month" label="Month" />
                <TimeFilterButton filter="year" label="Year" />
              </View>

              {stats?.timeSeriesData && (
                <>
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
                          labels: stats.timeSeriesData.labels,
                          datasets: [
                            {
                              data: data as number[],
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
                    labels: ['happy', 'calm', 'sad', 'anxious'].map(key => 
                      key.charAt(0).toUpperCase() + key.slice(1)
                    ),
                    datasets: [{
                      data: [0, 0, 0, 0]
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: 'white',
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
