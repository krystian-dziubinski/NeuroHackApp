import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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

export default function TestScreen() {
  const [stage, setStage] = useState<'pre' | 'intervention' | 'post'>('pre');
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});

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
        
        router.replace('/stats');
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
              styles.ratingText,
              ratings[`${stage}_${emotion.key}`] === rating && styles.selectedRatingText
            ]}>{rating}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const allEmotionsRated = emotions.every(
    emotion => ratings[`${stage}_${emotion.key}`]
  );

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
                onPress={() => router.replace('/')}
              >
                <Ionicons name="chevron-back" size={32} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.content}>
              <Text style={styles.title}>Intervention</Text>
              <Text style={styles.instructions}>
                Take a moment to breathe deeply and reflect on your emotions.
                {'\n\n'}
                When you're ready, we'll ask about your emotions again.
              </Text>
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>I'm Ready</Text>
              </TouchableOpacity>
            </View>
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
              <Text style={styles.title}>
                {stage === 'pre' ? 'How do you feel right now?' : 'How do you feel after the intervention?'}
              </Text>
              
              <View style={styles.emotionsSection}>
                <Text style={styles.sectionTitle}>Positive Emotions</Text>
                {emotions
                  .filter(e => e.category === 'positive')
                  .map((emotion) => (
                    <View key={emotion.key} style={styles.emotionContainer}>
                      <Text style={styles.emotionText}>{emotion.label}</Text>
                      {renderRatingButtons(emotion)}
                    </View>
                  ))}
              </View>

              <View style={styles.emotionsSection}>
                <Text style={styles.sectionTitle}>Negative Emotions</Text>
                {emotions
                  .filter(e => e.category === 'negative')
                  .map((emotion) => (
                    <View key={emotion.key} style={styles.emotionContainer}>
                      <Text style={styles.emotionText}>{emotion.label}</Text>
                      {renderRatingButtons(emotion)}
                    </View>
                  ))}
              </View>

              <TouchableOpacity 
                style={[styles.button, !allEmotionsRated && styles.buttonDisabled]}
                onPress={handleNext}
                disabled={!allEmotionsRated}
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
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emotionsSection: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 18,
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 30,
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  emotionContainer: {
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emotionText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  selectedRatingText: {
    color: '#1a2a6c',
    fontWeight: 'bold',
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
    minWidth: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
