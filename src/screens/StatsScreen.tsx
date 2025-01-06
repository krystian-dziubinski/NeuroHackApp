import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, BarChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

type TimeFilter = 'day' | 'week' | 'month' | 'year';

type Emotion = 
  | 'motivated' | 'compassionate' | 'grateful' | 'intrigued' 
  | 'purposeful' | 'contemplated' | 'energetic' | 'satisfied'
  | 'sad' | 'angry' | 'frightened' | 'disgusted' 
  | 'anxious' | 'agitated' | 'regretful' | 'annoyed';

interface Stats {
  totalTests: number;
  timeSeriesData: {
    labels: string[];
    positive: number[];
    negative: number[];
    overall: number[];
    emotions: {
      [key in Emotion]: number[];
    };
  };
}

interface TestData {
  timestamp: number;
  emotions: {
    [key in Emotion]: number;
  };
  pre: {
    [key in Emotion]: number;
  };
  post: {
    [key in Emotion]: number;
  };
}

const aggregateData = (data: TestData[], filter: TimeFilter): TestData[] => {
  const now = Date.now();
  let timeLimit: number;

  switch (filter) {
    case 'day':
      timeLimit = now - 24 * 60 * 60 * 1000;
      break;
    case 'week':
      timeLimit = now - 7 * 24 * 60 * 60 * 1000;
      break;
    case 'month':
      timeLimit = now - 30 * 24 * 60 * 60 * 1000;
      break;
    case 'year':
      timeLimit = now - 365 * 24 * 60 * 60 * 1000;
      break;
    default:
      timeLimit = 0;
  }

  return data
    .filter(item => item.timestamp >= timeLimit)
    .sort((a, b) => a.timestamp - b.timestamp);
};

const formatDate = (timestamp: number, filter: TimeFilter): string => {
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
    default:
      return '';
  }
};

const StatsScreen = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [selectedChart, setSelectedChart] = useState<'line' | 'bar'>('line');

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
      const filteredTests = aggregateData(tests, timeFilter);
      
      if (filteredTests.length === 0) {
        setStats(null);
        return;
      }

      const labels = filteredTests.map(test => formatDate(test.timestamp, timeFilter));
      
      const timeSeriesData = {
        labels,
        positive: filteredTests.map(test => 
          Object.entries(test.emotions)
            .filter(([key]) => ['motivated', 'compassionate', 'grateful', 'intrigued', 'purposeful', 'contemplated', 'energetic', 'satisfied'].includes(key))
            .reduce((sum, [_, value]) => sum + value, 0) / 8
        ),
        negative: filteredTests.map(test => 
          -Object.entries(test.emotions)
            .filter(([key]) => ['sad', 'angry', 'frightened', 'disgusted', 'anxious', 'agitated', 'regretful', 'annoyed'].includes(key))
            .reduce((sum, [_, value]) => sum + value, 0) / 8
        ),
        overall: filteredTests.map(test => 
          Object.values(test.emotions).reduce((sum, value) => sum + value, 0) / Object.keys(test.emotions).length
        ),
        emotions: Object.fromEntries(
          ['motivated', 'compassionate', 'grateful', 'intrigued', 'purposeful', 'contemplated', 'energetic', 'satisfied',
           'sad', 'angry', 'frightened', 'disgusted', 'anxious', 'agitated', 'regretful', 'annoyed'].map(emotion => [
            emotion,
            filteredTests.map(test => test.emotions[emotion as Emotion])
          ])
        ) as { [key in Emotion]: number[] }
      };

      setStats({
        totalTests: tests.length,
        timeSeriesData,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.title}>Statistics</Text>

            <View style={styles.filterContainer}>
              {(['day', 'week', 'month', 'year'] as TimeFilter[]).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    timeFilter === filter && styles.activeFilterButton
                  ]}
                  onPress={() => setTimeFilter(filter)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    timeFilter === filter && styles.activeFilterButtonText
                  ]}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {stats ? (
              <>
                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle}>Overall Emotional Changes</Text>
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
                    chartConfig={{
                      backgroundColor: '#000000',
                      backgroundGradientFrom: '#000000',
                      backgroundGradientTo: '#000000',
                      decimalPlaces: 1,
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      style: {
                        borderRadius: 16
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: '6 6',
                        stroke: 'rgba(255, 255, 255, 0.1)'
                      },
                      propsForLabels: {
                        fill: 'white',
                        fontSize: 12
                      }
                    }}
                    bezier
                    style={styles.chart}
                  />
                </View>

                <View style={styles.emotionChartsContainer}>
                  <Text style={styles.sectionTitle}>Individual Emotion Changes</Text>
                  {Object.entries(stats.timeSeriesData.emotions).map(([emotion, data]) => (
                    <View key={emotion} style={styles.chartContainer}>
                      <Text style={styles.chartTitle}>
                        {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                      </Text>
                      <LineChart
                        data={{
                          labels: stats.timeSeriesData.labels,
                          datasets: [
                            {
                              data: data,
                              color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                              strokeWidth: 2,
                            },
                          ],
                        }}
                        width={width - 40}
                        height={180}
                        chartConfig={{
                          backgroundColor: '#000000',
                          backgroundGradientFrom: '#000000',
                          backgroundGradientTo: '#000000',
                          decimalPlaces: 1,
                          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                          style: {
                            borderRadius: 16
                          },
                          propsForBackgroundLines: {
                            strokeDasharray: '6 6',
                            stroke: 'rgba(255, 255, 255, 0.1)'
                          },
                          propsForLabels: {
                            fill: 'white',
                            fontSize: 12
                          }
                        }}
                        bezier
                        style={styles.chart}
                      />
                    </View>
                  ))}
                </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statBox}>
                    <Text style={styles.statTitle}>Total Tests</Text>
                    <Text style={styles.statValue}>{stats.totalTests}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statTitle}>Average Change</Text>
                    <Text style={styles.statValue}>
                      {stats.timeSeriesData.overall[stats.timeSeriesData.overall.length - 1]?.toFixed(1) || '0.0'}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No data available for the selected time period</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

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
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeFilterButton: {
    backgroundColor: 'white',
  },
  filterButtonText: {
    color: 'white',
    fontSize: 16,
  },
  activeFilterButtonText: {
    color: '#1a2a6c',
  },
  chartContainer: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emotionChartsContainer: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  statTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default StatsScreen;
