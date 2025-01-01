import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NeuroHack</Text>
      <Text style={styles.subtitle}>Track Your Emotional States</Text>
      
      <Link href="/test" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Start New Test</Text>
        </TouchableOpacity>
      </Link>
      
      <Link href="/stats" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Statistics</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});
