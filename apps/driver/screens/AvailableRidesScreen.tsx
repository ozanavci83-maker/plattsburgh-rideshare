import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3000/api';

export default function AvailableRidesScreen({ navigation }: any) {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAvailableRides();
    const interval = setInterval(loadAvailableRides, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAvailableRides = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const response = await axios.get(`${API_URL}/rides/active/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRides(response.data);
      }
    } catch (error) {
      console.error('Error loading rides:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAvailableRides();
  };

  const renderRideItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.rideCard}
      onPress={() => navigation.navigate('RideDetails', { ride: item })}
    >
      <View style={styles.rideHeader}>
        <View style={styles.rideInfo}>
          <Text style={styles.rideAddress}>{item.pickupAddress}</Text>
          <Text style={styles.rideAddress}>→ {item.dropoffAddress}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#27ae60" />
      </View>

      <View style={styles.rideDetails}>
        <View style={styles.detailItem}>
          <MaterialIcons name="attach-money" size={16} color="#27ae60" />
          <Text style={styles.detailText}>${item.requestedPrice}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name="payment" size={16} color="#27ae60" />
          <Text style={styles.detailText}>{item.paymentMethod}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading available rides...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {rides.length > 0 ? (
        <FlatList
          data={rides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="directions-car" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No available rides</Text>
          <Text style={styles.emptySubText}>Check back soon for new ride requests</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  rideCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rideInfo: {
    flex: 1,
  },
  rideAddress: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  rideDetails: {
    flexDirection: 'row',
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
});
