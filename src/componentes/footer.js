import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { auth, firestore } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function Footer() {
  const navigation = useNavigation();
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const fetchUserType = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserType(userDoc.data().tipo);
        }
      }
    };

    fetchUserType();
  }, []);

  return (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
        <Icon name="home-outline" size={24} color="#666" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Agenda')}>
        <Icon name="calendar-outline" size={24} color="#666" />
        <Text style={styles.navText}>Agenda</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Pesquisar')}>
        <Icon name="search-outline" size={24} color="#666" />
        <Text style={styles.navText}>Pesquisar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MeusEventos')}>
        <Icon name="list-outline" size={24} color="#666" />
        <Text style={styles.navText}>Meus Eventos</Text>
      </TouchableOpacity>
      {userType === 2 && (
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AdmTela')}>
          <Icon name="settings-outline" size={24} color="#666" />
          <Text style={styles.navText}>Admin</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
    color: '#666',
  },
});