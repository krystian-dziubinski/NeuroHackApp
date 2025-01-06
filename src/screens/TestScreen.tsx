import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const emotions = [
  // Positive emotions
  { label: 'Motivated', key: 'motivated', category: 'positive' },
  { label: 'Compassionate', key: 'compassionate', category: 'positive' },
  { label: 'Grateful', key: 'grateful', category: 'positive' },
  { label: 'Intrigued', key: 'intrigued', category: 'positive' },
  { label: 'Purposeful', key: 'purposeful', category: 'positive' },
  { label: 'Contemplated', key: 'contemplated', category: 'positive' },
  { label: 'Energetic', key: 'energetic', category: 'positive' },
  { label: 'Satisfied', key: 'satisfied', category: 'positive' },
  
  // Negative emotions
  { label: 'Sad', key: 'sad', category: 'negative' },
  { label: 'Angry', key: 'angry', category: 'negative' },
  { label: 'Frightened', key: 'frightened', category: 'negative' },
  { label: 'Disgusted', key: 'disgusted', category: 'negative' },
  { label: 'Anxious', key: 'anxious', category: 'negative' },
  { label: 'Agitated', key: 'agitated', category: 'negative' },
  { label: 'Regretful', key: 'regretful', category: 'negative' },
  { label: 'Annoyed', key: 'annoyed', category: 'negative' },
];

const TestScreen = () => {
  const navigation = useNavigation();
  const [stage, setStage] = useState<'pre' | 'intervention' | 'post'>('pre');
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});

  // Reset state when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setStage('pre');
      setRatings({});
    });

    return unsubscribe;
  }, [navigation]);

  const handleRate = (emotion: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [`${stage}_${emotion}`]: rating
    }));
  };

  const handleNext = async () => {
    if (stage === 'pre') {
      setStage('intervention');
    } else if (stage === 'intervention') {
      setStage('post');
    } else {
      try {
        const timestamp = Date.now();
        const testData = {
          timestamp,
          emotions: Object.fromEntries(
            emotions.map(emotion => [
              emotion.key,
              (ratings[`post_${emotion.key}`] || 0) - (ratings[`pre_${emotion.key}`] || 0)
            ])
          ),
          pre: Object.fromEntries(
            emotions.map(emotion => [
              emotion.key,
              ratings[`pre_${emotion.key}`] || 0
            ])
          ),
          post: Object.fromEntries(
            emotions.map(emotion => [
              emotion.key,
              ratings[`post_${emotion.key}`] || 0
            ])
          ),
          categories: {
            positive: emotions
              .filter(e => e.category === 'positive')
              .map(e => e.key),
            negative: emotions
              .filter(e => e.category === 'negative')
              .map(e => e.key)
          }
        };
        
        const existingTestsString = await AsyncStorage.getItem('tests');
        const existingTests = existingTestsString ? JSON.parse(existingTestsString) : [];
        await AsyncStorage.setItem('tests', JSON.stringify([...existingTests, testData]));
        
        navigation.navigate('Stats');
      } catch (error) {
        console.error('Error saving test data:', error);
      }
    }
  };

  const renderRatingButtons = (emotion: { key: string, label: string }) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.ratingButton,
              ratings[`${stage}_${emotion.key}`] === rating && styles.selectedRating
            ]}
            onPress={() => handleRate(emotion.key, rating)}
          >
            <Text style={[
              styles.ratingButtonText,
              ratings[`${stage}_${emotion.key}`] === rating && styles.selectedRatingText
            ]}>
              {rating}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getStageTitle = () => {
    switch (stage) {
      case 'pre':
        return 'Pre-Test';
      case 'intervention':
        return 'Intervention';
      case 'post':
        return 'Post-Test';
      default:
        return '';
    }
  };

  const getStageDescription = () => {
    switch (stage) {
      case 'pre':
        return 'Rate how you feel right now';
      case 'intervention':
        return 'Take a moment to breathe deeply and relax';
      case 'post':
        return 'Rate how you feel after the intervention';
      default:
        return '';
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
            <Text style={styles.title}>{getStageTitle()}</Text>
            <Text style={styles.description}>{getStageDescription()}</Text>

            {stage === 'intervention' ? (
              <View style={styles.interventionContainer}>
                <Icon name="water-outline" size={100} color="white" />
                <Text style={styles.interventionText}>
                  Take 3 deep breaths{'\n'}
                  Focus on the present moment{'\n'}
                  Let go of any tension
                </Text>
              </View>
            ) : (
              <View style={styles.emotionsContainer}>
                {emotions.map((emotion) => (
                  <View key={emotion.key} style={styles.emotionRow}>
                    <Text style={styles.emotionLabel}>{emotion.label}</Text>
                    {renderRatingButtons(emotion)}
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {stage === 'post' ? 'Finish' : 'Next'}
              </Text>
            </TouchableOpacity>
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
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  emotionsContainer: {
    marginBottom: 30,
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  emotionLabel: {
    color: 'white',
    fontSize: 16,
    width: 120,
  },
  ratingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRating: {
    backgroundColor: 'white',
  },
  ratingButtonText: {
    color: 'white',
    fontSize: 16,
  },
  selectedRatingText: {
    color: '#1a2a6c',
  },
  nextButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  nextButtonText: {
    color: '#1a2a6c',
    fontSize: 18,
    fontWeight: 'bold',
  },
  interventionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  interventionText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 30,
    marginTop: 30,
  },
});

export default TestScreen;
