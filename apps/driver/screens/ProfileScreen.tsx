import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3000/api';

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);

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

        const driverResponse = await axios.get(`${API_URL}/drivers/${parsedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDriver(driverResponse.data);
        setFormData(driverResponse.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return;

    setLoading(true);

    try {
      const response = await axios.put(
        `${API_URL}/drivers/${driver.id}`,
        {
          vehicleMake: formData.vehicleMake,
          vehicleModel: formData.vehicleModel,
          vehicleYear: parseInt(formData.vehicleYear),
          vehicleColor: formData.vehicleColor,
          licensePlate: formData.licensePlate,
          driverLicenseNumber: formData.driverLicenseNumber,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDriver(response.data);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user || !driver) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <MaterialIcons name="account-circle" size={80} color="#27ae60" />
        <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{driver.totalRides}</Text>
          <Text style={styles.statLabel}>Total Rides</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>⭐ {driver.rating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <MaterialIcons name="edit" size={20} color="#27ae60" />
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Make"
              value={formData.vehicleMake}
              onChangeText={(text) => setFormData({ ...formData, vehicleMake: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Model"
              value={formData.vehicleModel}
              onChangeText={(text) => setFormData({ ...formData, vehicleModel: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Year"
              value={formData.vehicleYear?.toString()}
              onChangeText={(text) => setFormData({ ...formData, vehicleYear: text })}
              keyboardType="number-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Color"
              value={formData.vehicleColor}
              onChangeText={(text) => setFormData({ ...formData, vehicleColor: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="License Plate"
              value={formData.licensePlate}
              onChangeText={(text) => setFormData({ ...formData, licensePlate: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Driver License Number"
              value={formData.driverLicenseNumber}
              onChangeText={(text) => setFormData({ ...formData, driverLicenseNumber: text })}
            />

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditing(false);
                  setFormData(driver);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Vehicle</Text>
            <Text style={styles.infoValue}>
              {driver.vehicleColor} {driver.vehicleMake} {driver.vehicleModel} ({driver.vehicleYear})
            </Text>
            <Text style={styles.infoLabel}>License Plate</Text>
            <Text style={styles.infoValue}>{driver.licensePlate}</Text>
            <Text style={styles.infoLabel}>Driver License</Text>
            <Text style={styles.infoValue}>{driver.driverLicenseNumber}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Status</Text>
        <View style={styles.statusCard}>
          <MaterialIcons
            name={driver.status === 'approved' ? 'check-circle' : 'schedule'}
            size={20}
            color={driver.status === 'approved' ? '#4CAF50' : '#FF9800'}
          />
          <Text style={styles.statusText}>
            Status: {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoCard}>
          <MaterialIcons name="phone" size={20} color="#27ae60" />
          <Text style={styles.infoText}>{user.phone}</Text>
        </View>
        <View style={styles.infoCard}>
          <MaterialIcons name="email" size={20} color="#27ae60" />
          <Text style={styles.infoText}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Earnings</Text>
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Total Earnings</Text>
          <Text style={styles.earningsValue}>${driver.totalEarnings.toFixed(2)}</Text>
          <Text style={styles.earningsLabel}>Average per Ride</Text>
          <Text style={styles.earningsValue}>
            ${driver.totalRides > 0 ? (driver.totalEarnings / driver.totalRides).toFixed(2) : '0.00'}
          </Text>
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
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: 'bold',
    marginTop: 10,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 15,
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  statusCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  earningsCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 8,
  },
  earningsLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: 'bold',
    marginTop: 10,
  },
  earningsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
    marginTop: 3,
  },
});
