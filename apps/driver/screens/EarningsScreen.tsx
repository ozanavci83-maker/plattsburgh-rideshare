import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3000/api';

export default function EarningsScreen() {
  const [driver, setDriver] = useState<any>(null);
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarningsData();
  }, []);

  const loadEarningsData = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('authToken');

      if (user && token) {
        const userData = JSON.parse(user);

        const driverResponse = await axios.get(`${API_URL}/drivers/${userData.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDriver(driverResponse.data);

        const ridesResponse = await axios.get(`${API_URL}/drivers/${userData.id}/rides`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRides(ridesResponse.data.filter((r: any) => r.status === 'completed'));
      }
    } catch (error) {
      console.error('Error loading earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRideItem = ({ item }: any) => (
    <View style={styles.rideItem}>
      <View style={styles.rideInfo}>
        <Text style={styles.rideAddress}>{item.pickupAddress}</Text>
        <Text style={styles.rideTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.rideEarning}>${item.finalPrice || item.requestedPrice}</Text>
    </View>
  );

  if (loading || !driver) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const averagePerRide = driver.totalRides > 0 ? driver.totalEarnings / driver.totalRides : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Earnings</Text>
          <Text style={styles.summaryValue}>${driver.totalEarnings.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Rides</Text>
          <Text style={styles.summaryValue}>{driver.totalRides}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Average/Ride</Text>
          <Text style={styles.summaryValue}>${averagePerRide.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <MaterialIcons name="trending-up" size={32} color="#27ae60" />
          <Text style={styles.statValue}>${driver.totalEarnings.toFixed(2)}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialIcons name="directions-car" size={32} color="#2196F3" />
          <Text style={styles.statValue}>{rides.length}</Text>
          <Text style={styles.statLabel}>Completed Rides</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Ride History</Text>
      {rides.length > 0 ? (
        <FlatList
          data={rides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.emptyText}>No completed rides yet</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginTop: 5,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#eee',
  },
  statsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  rideItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rideInfo: {
    flex: 1,
  },
  rideAddress: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  rideTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
  },
  rideEarning: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});
