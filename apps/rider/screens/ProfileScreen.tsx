import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3000/api';

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [rider, setRider] = useState<any>(null);
  const [ratings, setRatings] = useState<any>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('authToken');

      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        const riderResponse = await axios.get(`${API_URL}/riders/${parsedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRider(riderResponse.data);

        const ratingsResponse = await axios.get(`${API_URL}/ratings/${parsedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRatings(ratingsResponse.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  if (!user || !rider) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <MaterialIcons name="account-circle" size={80} color="#0066cc" />
        <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{rider.totalRides}</Text>
          <Text style={styles.statLabel}>Total Rides</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>⭐ {rider.rating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoCard}>
          <MaterialIcons name="phone" size={20} color="#0066cc" />
          <Text style={styles.infoText}>{user.phone}</Text>
        </View>
        <View style={styles.infoCard}>
          <MaterialIcons name="email" size={20} color="#0066cc" />
          <Text style={styles.infoText}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verification Status</Text>
        <View style={styles.verificationCard}>
          <MaterialIcons
            name={rider.phoneVerified ? 'check-circle' : 'cancel'}
            size={20}
            color={rider.phoneVerified ? '#4CAF50' : '#f44336'}
          />
          <Text style={styles.verificationText}>
            Phone Verified: {rider.phoneVerified ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={styles.verificationCard}>
          <MaterialIcons
            name={rider.profileCompleted ? 'check-circle' : 'cancel'}
            size={20}
            color={rider.profileCompleted ? '#4CAF50' : '#f44336'}
          />
          <Text style={styles.verificationText}>
            Profile Completed: {rider.profileCompleted ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>

      {ratings && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
          <View style={styles.ratingsCard}>
            <Text style={styles.averageRating}>{ratings.averageRating.toFixed(1)}</Text>
            <Text style={styles.ratingsCount}>Based on {ratings.totalRatings} ratings</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <View style={styles.paymentCard}>
          <MaterialIcons name="payment" size={20} color="#0066cc" />
          <Text style={styles.paymentText}>Cash, Zelle, PayPal, Venmo</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    backgroundColor: 'white',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statsCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#eee',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    marginBottom: 10,
    color: '#333',
  },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  verificationCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  verificationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  ratingsCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  averageRating: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  ratingsCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  paymentCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
});
