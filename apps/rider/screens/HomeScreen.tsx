import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3000/api';

export default function HomeScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          // Fetch rides
          const response = await axios.get(`${API_URL}/riders/${JSON.parse(userData).id}/rides`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setRides(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const renderRideItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.rideCard}
      onPress={() => navigation.navigate('RideTracking', { ride: item })}
    >
      <View style={styles.rideInfo}>
        <Text style={styles.rideAddress}>{item.pickupAddress}</Text>
        <Text style={styles.rideAddress}>→ {item.dropoffAddress}</Text>
        <Text style={styles.ridePrice}>${item.requestedPrice}</Text>
        <Text style={[styles.rideStatus, { color: getStatusColor(item.status) }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#f44336';
      case 'in_progress':
        return '#2196F3';
      default:
        return '#FF9800';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user?.firstName}!</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <MaterialIcons name="account-circle" size={32} color="#0066cc" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.requestButton}
        onPress={() => navigation.navigate('RequestRide')}
      >
        <MaterialIcons name="location-on" size={24} color="white" />
        <Text style={styles.requestButtonText}>Request a Ride</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Rides</Text>
      {rides.length > 0 ? (
        <FlatList
          data={rides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.emptyText}>No rides yet. Request your first ride!</Text>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  requestButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  rideCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  rideInfo: {
    gap: 5,
  },
  rideAddress: {
    fontSize: 14,
    color: '#333',
  },
  ridePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
    marginTop: 5,
  },
  rideStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
