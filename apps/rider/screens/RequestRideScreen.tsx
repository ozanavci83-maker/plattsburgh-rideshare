import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ScrollView, Picker } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default function RequestRideScreen({ navigation }: any) {
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [requestedPrice, setRequestedPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  const handleRequestRide = async () => {
    if (!pickupAddress || !dropoffAddress || !requestedPrice) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const user = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('authToken');

      if (!user || !token) {
        Alert.alert('Error', 'User data not found');
        return;
      }

      const userData = JSON.parse(user);

      // Mock coordinates for Plattsburgh, NY
      const response = await axios.post(
        `${API_URL}/rides`,
        {
          riderId: userData.id,
          pickupLatitude: 44.6995,
          pickupLongitude: -73.4529,
          pickupAddress,
          dropoffLatitude: 44.7,
          dropoffLongitude: -73.45,
          dropoffAddress,
          requestedPrice: parseFloat(requestedPrice),
          paymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Success', 'Ride requested! Waiting for driver...');
      navigation.navigate('RideTracking', { ride: response.data });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to request ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Request a Ride</Text>

      <Text style={styles.label}>Pickup Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter pickup address"
        value={pickupAddress}
        onChangeText={setPickupAddress}
        editable={!loading}
      />

      <Text style={styles.label}>Dropoff Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter dropoff address"
        value={dropoffAddress}
        onChangeText={setDropoffAddress}
        editable={!loading}
      />

      <Text style={styles.label}>Suggested Price ($)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter price (negotiable)"
        value={requestedPrice}
        onChangeText={setRequestedPrice}
        keyboardType="decimal-pad"
        editable={!loading}
      />

      <Text style={styles.label}>Payment Method</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={paymentMethod}
          onValueChange={setPaymentMethod}
          enabled={!loading}
        >
          <Picker.Item label="Cash" value="cash" />
          <Picker.Item label="Zelle" value="zelle" />
          <Picker.Item label="PayPal" value="paypal" />
          <Picker.Item label="Venmo" value="venmo" />
        </Picker>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRequestRide}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Requesting...' : 'Request Ride'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButton}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
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
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    color: '#f44336',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
