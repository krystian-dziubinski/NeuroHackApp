import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useEffect, useRef } from 'react';

const { width, height } = Dimensions.get('window');

const AnimatedLogo = () => {
  const squareAnim = useRef(new Animated.Value(-100)).current;
  const circleAnim = useRef(new Animated.Value(-100)).current;
  const triangleAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.stagger(50, [
      Animated.spring(squareAnim, {
        toValue: 0,
        tension: 180,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(circleAnim, {
        toValue: 0,
        tension: 180,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(triangleAnim, {
        toValue: 0,
        tension: 180,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.logoContainer}>
      <Animated.View
        style={[
          styles.shape,
          styles.square,
          {
            transform: [{ translateY: squareAnim }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.shape,
          styles.circle,
          {
            transform: [{ translateY: circleAnim }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.shape,
          styles.triangle,
          {
            transform: [{ translateY: triangleAnim }],
          },
        ]}
      />
    </View>
  );
};

const AnimatedGradient = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

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
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <AnimatedGradient />
          <View style={styles.content}>
            <View style={styles.logo}>
              <AnimatedLogo />
            </View>
            <Text style={styles.title}>Samba</Text>
            <Text style={styles.subtitle}>NeuroHack your brain</Text>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.navigate('Test')}
            >
              <Text style={styles.buttonText}>Start self-experimentation</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.navigate('Stats')}
            >
              <Text style={styles.buttonText}>Analyze your results</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    marginBottom: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  shape: {
    position: 'absolute',
  },
  square: {
    width: 30,
    height: 30,
    backgroundColor: '#3498db',
    left: 10,
    top: 10,
  },
  circle: {
    width: 30,
    height: 30,
    backgroundColor: '#e74c3c',
    borderRadius: 15,
    left: 55,
    top: 15,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#f1c40f',
    left: 30,
    top: 60,
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
