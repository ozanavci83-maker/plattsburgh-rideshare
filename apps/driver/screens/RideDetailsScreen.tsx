import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3000/api';

export default function RideDetailsScreen({ route, navigation }: any) {
  const [ride, setRide] = useState(route.params?.ride);
  const [rider, setRider] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    loadRideDetails();
  }, []);

  const loadRideDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token && ride?.id) {
        const response = await axios.get(`${API_URL}/rides/${ride.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRide(response.data);
      }
    } catch (error) {
      console.error('Error loading ride details:', error);
    }
  };

  const handleAcceptRide = async () => {
    const user = await AsyncStorage.getItem('user');
    const token = await AsyncStorage.getItem('authToken');

    if (!user || !token) return;

    const userData = JSON.parse(user);
    setActionInProgress(true);

    try {
      const response = await axios.put(
        `${API_URL}/rides/${ride.id}/accept`,
        { driverId: userData.id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRide(response.data);
      Alert.alert('Success', 'Ride accepted! Head to the pickup location.');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to accept ride');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleStartRide = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return;

    setActionInProgress(true);

    try {
      const response = await axios.put(
        `${API_URL}/rides/${ride.id}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRide(response.data);
      Alert.alert('Success', 'Ride started!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to start ride');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleCompleteRide = async () => {
    Alert.prompt(
      'Complete Ride',
      'Enter the final price (or leave blank for requested price)',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Complete',
          onPress: async (finalPrice) => {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) return;

            setActionInProgress(true);

            try {
              const response = await axios.put(
                `${API_URL}/rides/${ride.id}/complete`,
                {
                  finalPrice: finalPrice ? parseFloat(finalPrice) : ride.requestedPrice,
                },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              setRide(response.data);
              Alert.alert('Success', 'Ride completed!');
              navigation.navigate('RateRider', { ride: response.data });
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to complete ride');
            } finally {
              setActionInProgress(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleRejectRide = async () => {
    Alert.alert('Reject Ride', 'Are you sure you want to reject this ride?', [
      { text: 'No', onPress: () => {} },
      {
        text: 'Yes',
        onPress: async () => {
          const token = await AsyncStorage.getItem('authToken');
          if (!token) return;

          setActionInProgress(true);

          try {
            await axios.put(
              `${API_URL}/rides/${ride.id}/reject`,
              {},
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            Alert.alert('Success', 'Ride rejected');
            navigation.goBack();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to reject ride');
          } finally {
            setActionInProgress(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statusCard}>
        <Text style={[styles.status, { color: getStatusColor(ride.status) }]}>
          {ride.status.toUpperCase()}
        </Text>
      </View>

      <View style={styles.locationCard}>
        <View style={styles.locationItem}>
          <MaterialIcons name="location-on" size={24} color="#27ae60" />
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

      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>Suggested Price</Text>
        <Text style={styles.price}>${ride.requestedPrice}</Text>
        <Text style={styles.paymentMethod}>{ride.paymentMethod.toUpperCase()}</Text>
      </View>

      {ride.status === 'requested' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.acceptButton, actionInProgress && styles.buttonDisabled]}
            onPress={handleAcceptRide}
            disabled={actionInProgress}
          >
            <MaterialIcons name="check-circle" size={20} color="white" />
            <Text style={styles.acceptButtonText}>
              {actionInProgress ? 'Accepting...' : 'Accept Ride'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rejectButton, actionInProgress && styles.buttonDisabled]}
            onPress={handleRejectRide}
            disabled={actionInProgress}
          >
            <MaterialIcons name="cancel" size={20} color="white" />
            <Text style={styles.rejectButtonText}>
              {actionInProgress ? 'Rejecting...' : 'Reject'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {ride.status === 'accepted' && (
        <TouchableOpacity
          style={[styles.startButton, actionInProgress && styles.buttonDisabled]}
          onPress={handleStartRide}
          disabled={actionInProgress}
        >
          <MaterialIcons name="directions-car" size={20} color="white" />
          <Text style={styles.startButtonText}>
            {actionInProgress ? 'Starting...' : 'Start Ride'}
          </Text>
        </TouchableOpacity>
      )}

      {ride.status === 'in_progress' && (
        <TouchableOpacity
          style={[styles.completeButton, actionInProgress && styles.buttonDisabled]}
          onPress={handleCompleteRide}
          disabled={actionInProgress}
        >
          <MaterialIcons name="done-all" size={20} color="white" />
          <Text style={styles.completeButtonText}>
            {actionInProgress ? 'Completing...' : 'Complete Ride'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27ae60',
    marginTop: 5,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  acceptButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rejectButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  startButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
