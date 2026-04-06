import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3000/api';

export default function RideTrackingScreen({ route, navigation }: any) {
  const [ride, setRide] = useState(route.params?.ride);
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRideDetails();
    const interval = setInterval(loadRideDetails, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadRideDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token && ride?.id) {
        const response = await axios.get(`${API_URL}/rides/${ride.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRide(response.data);

        if (response.data.driverId && !driver) {
          const driverResponse = await axios.get(`${API_URL}/drivers/${response.data.driverId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setDriver(driverResponse.data);
        }
      }
    } catch (error) {
      console.error('Error loading ride details:', error);
    }
  };

  const handleCancelRide = async () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel this ride?', [
      { text: 'No', onPress: () => {} },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('authToken');
            await axios.put(
              `${API_URL}/rides/${ride.id}/cancel`,
              {},
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            Alert.alert('Success', 'Ride cancelled');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to cancel ride');
          }
        },
      },
    ]);
  };

  const handleCompleteRide = async () => {
    if (ride.status === 'completed') {
      navigation.navigate('RateDriver', { ride, driver });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requested':
        return 'schedule';
      case 'accepted':
        return 'check-circle';
      case 'in_progress':
        return 'directions-car';
      case 'completed':
        return 'done-all';
      default:
        return 'cancel';
    }
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.statusCard}>
        <MaterialIcons name={getStatusIcon(ride.status)} size={48} color={getStatusColor(ride.status)} />
        <Text style={[styles.status, { color: getStatusColor(ride.status) }]}>
          {ride.status.toUpperCase()}
        </Text>
      </View>

      <View style={styles.locationCard}>
        <View style={styles.locationItem}>
          <MaterialIcons name="location-on" size={24} color="#0066cc" />
          <View style={styles.locationText}>
            <Text style={styles.label}>Pickup</Text>
            <Text style={styles.address}>{ride.pickupAddress}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.locationItem}>
          <MaterialIcons name="location-on" size={24} color="#f44336" />
          <View style={styles.locationText}>
            <Text style={styles.label}>Dropoff</Text>
            <Text style={styles.address}>{ride.dropoffAddress}</Text>
          </View>
        </View>
      </View>

      {driver && ride.status !== 'requested' && (
        <View style={styles.driverCard}>
          <Text style={styles.cardTitle}>Driver Information</Text>
          <Text style={styles.driverName}>{driver.user?.firstName} {driver.user?.lastName}</Text>
          <Text style={styles.driverInfo}>
            {driver.vehicleColor} {driver.vehicleMake} {driver.vehicleModel}
          </Text>
          <Text style={styles.driverInfo}>License Plate: {driver.licensePlate}</Text>
          <Text style={styles.driverRating}>Rating: ⭐ {driver.rating.toFixed(1)}</Text>
        </View>
      )}

      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>Price</Text>
        <Text style={styles.price}>${ride.finalPrice || ride.requestedPrice}</Text>
        <Text style={styles.paymentMethod}>{ride.paymentMethod.toUpperCase()}</Text>
      </View>

      {ride.status === 'requested' && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelRide}>
          <Text style={styles.cancelButtonText}>Cancel Ride</Text>
        </TouchableOpacity>
      )}

      {ride.status === 'completed' && (
        <TouchableOpacity style={styles.rateButton} onPress={handleCompleteRide}>
          <Text style={styles.rateButtonText}>Rate Driver</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  status: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  locationCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  locationText: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#999',
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
    color: '#333',
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  driverCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 10,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  driverInfo: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  driverRating: {
    fontSize: 13,
    color: '#0066cc',
    marginTop: 5,
    fontWeight: 'bold',
  },
  priceCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: 'bold',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066cc',
    marginTop: 5,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rateButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  rateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
