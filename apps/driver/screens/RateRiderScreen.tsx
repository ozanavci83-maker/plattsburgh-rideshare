import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3000/api';

export default function RateRiderScreen({ route, navigation }: any) {
  const { ride } = route.params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitRating = async () => {
    setLoading(true);
    try {
      const user = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('authToken');

      if (!user || !token) {
        Alert.alert('Error', 'User data not found');
        return;
      }

      const userData = JSON.parse(user);

      await axios.post(
        `${API_URL}/ratings`,
        {
          rideId: ride.id,
          raterId: userData.id,
          rateeId: ride.riderId,
          rating,
          comment: comment || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Success', 'Thank you for rating!');
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <MaterialIcons
              name={star <= rating ? 'star' : 'star-outline'}
              size={40}
              color={star <= rating ? '#FFD700' : '#ddd'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate Your Rider</Text>

      <View style={styles.riderCard}>
        <Text style={styles.riderName}>Rider</Text>
        <Text style={styles.riderInfo}>Ride completed successfully</Text>
      </View>

      <Text style={styles.label}>How was your experience?</Text>
      {renderStars()}

      <Text style={styles.ratingText}>
        {rating === 1 && 'Poor'}
        {rating === 2 && 'Fair'}
        {rating === 3 && 'Good'}
        {rating === 4 && 'Very Good'}
        {rating === 5 && 'Excellent'}
      </Text>

      <Text style={styles.label}>Additional Comments (Optional)</Text>
      <TextInput
        style={styles.commentInput}
        placeholder="Share your feedback..."
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmitRating}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit Rating'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Text style={styles.skipButton}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  riderCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  riderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  riderInfo: {
    fontSize: 13,
    color: '#666',
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 30,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
  },
});
