import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3000/api';

export default function HomeScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [activeRides, setActiveRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDriverData();
    const interval = setInterval(loadDriverData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDriverData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('authToken');

      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        const driverResponse = await axios.get(`${API_URL}/drivers/${parsedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDriver(driverResponse.data);
        setIsOnline(driverResponse.data.isOnline);

        if (driverResponse.data.status === 'approved' && driverResponse.data.isOnline) {
          const ridesResponse = await axios.get(`${API_URL}/rides/active/list`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setActiveRides(ridesResponse.data);
        }
      }
    } catch (error) {
      console.error('Error loading driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async (value: boolean) => {
    if (driver?.status !== 'approved') {
      Alert.alert('Error', 'Your account is not approved yet');
      return;
    }

    if (!driver?.vehicleMake || !driver?.driverLicenseNumber) {
      Alert.alert('Error', 'Please complete your profile first');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      await axios.post(
        `${API_URL}/drivers/${driver.id}/toggle-online`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsOnline(value);
      loadDriverData();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle online status');
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
      onPress={() => navigation.navigate('RideDetails', { ride: item })}
    >
      <View style={styles.rideInfo}>
        <Text style={styles.rideAddress}>{item.pickupAddress}</Text>
        <Text style={styles.rideAddress}>→ {item.dropoffAddress}</Text>
        <Text style={styles.ridePrice}>${item.requestedPrice}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#27ae60" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (driver?.status === 'pending') {
    return (
      <View style={styles.container}>
        <View style={styles.pendingCard}>
          <MaterialIcons name="schedule" size={48} color="#FF9800" />
          <Text style={styles.pendingTitle}>Account Pending Review</Text>
          <Text style={styles.pendingText}>
            Your driver account is pending admin approval. You'll be notified once it's approved.
          </Text>
        </View>
      </View>
    );
  }

  if (driver?.status === 'rejected') {
    return (
      <View style={styles.container}>
        <View style={styles.rejectedCard}>
          <MaterialIcons name="cancel" size={48} color="#f44336" />
          <Text style={styles.rejectedTitle}>Account Rejected</Text>
          <Text style={styles.rejectedText}>
            Your driver account application was rejected. Please contact support for more information.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Welcome, {user?.firstName}!</Text>
          <Text style={styles.status}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <MaterialIcons name="account-circle" size={32} color="#27ae60" />
        </TouchableOpacity>
      </View>

      <View style={styles.toggleCard}>
        <Text style={styles.toggleLabel}>Go Online</Text>
        <Switch
          value={isOnline}
          onValueChange={handleToggleOnline}
          trackColor={{ false: '#ccc', true: '#81C784' }}
          thumbColor={isOnline ? '#27ae60' : '#f4f3f4'}
        />
      </View>

      {isOnline && (
        <>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{driver?.totalRides}</Text>
              <Text style={styles.statLabel}>Total Rides</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${driver?.totalEarnings.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ {driver?.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Available Rides ({activeRides.length})</Text>
          {activeRides.length > 0 ? (
            <FlatList
              data={activeRides}
              renderItem={renderRideItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>No available rides at the moment</Text>
          )}
        </>
      )}

      <TouchableOpacity style={styles.earningsButton} onPress={() => navigation.navigate('Earnings')}>
        <MaterialIcons name="trending-up" size={20} color="white" />
        <Text style={styles.earningsButtonText}>View Earnings</Text>
      </TouchableOpacity>

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
  status: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  toggleCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statsCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  rideCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  rideInfo: {
    flex: 1,
  },
  rideAddress: {
    fontSize: 14,
    color: '#333',
  },
  ridePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  earningsButton: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  earningsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pendingCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 50,
  },
  pendingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
    marginTop: 15,
  },
  pendingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  rejectedCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 50,
  },
  rejectedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f44336',
    marginTop: 15,
  },
  rejectedText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});
