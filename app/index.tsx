import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';

const { width, height } = Dimensions.get('window');

const AnimatedGradient = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.6,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 2000,
        useNativeDriver: true,
      })
    ]);

    Animated.loop(pulse).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.animatedCircle,
        {
          opacity: fadeAnim,
        },
      ]}
    />
  );
};

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <AnimatedGradient />
        <View style={styles.content}>
          <Text style={styles.title}>Samba</Text>
          <Text style={styles.subtitle}>NeuroHack your brain 🧠</Text>
          
          <Link href="/test" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Start Hacking Your Brain 🧪</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/stats" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Analyze Your Results 📊</Text>
            </TouchableOpacity>
          </Link>
        </View>
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
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 15,
    borderRadius: 15,
    width: '80%',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  animatedCircle: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -width * 0.5,
    left: -width * 0.25,
  }
});
