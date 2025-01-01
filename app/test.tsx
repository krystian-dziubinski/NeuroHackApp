import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const emotions = [
  { label: 'Sad', key: 'sad' },
  { label: 'Happy', key: 'happy' },
  { label: 'Anxious', key: 'anxious' },
  { label: 'Calm', key: 'calm' },
];

export default function TestScreen() {
  const [stage, setStage] = useState('pre');
  const [ratings, setRatings] = useState<Record<string, number>>({});

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
        const timestamp = new Date().toISOString();
        const testData = {
          timestamp,
          ...ratings
        };
        
        const existingData = await AsyncStorage.getItem('testResults');
        const allTests = existingData ? JSON.parse(existingData) : [];
        allTests.push(testData);
        
        await AsyncStorage.setItem('testResults', JSON.stringify(allTests));
        router.push('/stats');
      } catch (error) {
        console.error('Error saving test:', error);
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
              styles.ratingText,
              ratings[`${stage}_${emotion.key}`] === rating && styles.selectedRatingText
            ]}>{rating}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (stage === 'intervention') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Time for Intervention</Text>
        <Text style={styles.instructions}>
          Take a moment to watch an uplifting video or do a calming activity of your choice.
          When you're ready, proceed to rate your emotions again.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>I'm Ready</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {stage === 'pre' ? 'How do you feel right now?' : 'How do you feel after the intervention?'}
      </Text>
      
      {emotions.map((emotion) => (
        <View key={emotion.key} style={styles.emotionContainer}>
          <Text style={styles.emotionText}>{emotion.label}</Text>
          {renderRatingButtons(emotion)}
        </View>
      ))}

      <TouchableOpacity 
        style={[styles.button, !Object.keys(ratings).length && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={!Object.keys(ratings).length}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  emotionContainer: {
    marginBottom: 20,
  },
  emotionText: {
    fontSize: 18,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ratingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRating: {
    backgroundColor: '#007AFF',
  },
  ratingText: {
    fontSize: 18,
    color: '#000',
  },
  selectedRatingText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 40,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});
