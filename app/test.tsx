import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={32} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
              <View style={styles.content}>
                <Text style={styles.title}>Time for Intervention</Text>
                <Text style={styles.instructions}>
                  Take a moment to watch an uplifting video or do a calming activity of your choice.
                  When you're ready, proceed to rate your emotions again.
                </Text>
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                  <Text style={styles.buttonText}>I'm Ready</Text>
                </TouchableOpacity>
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
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={32} color="white" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.content}>
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
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  instructions: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 28,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  emotionContainer: {
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emotionText: {
    fontSize: 24,
    marginBottom: 15,
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedRating: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  ratingText: {
    fontSize: 20,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  selectedRatingText: {
    color: '#1a2a6c',
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
