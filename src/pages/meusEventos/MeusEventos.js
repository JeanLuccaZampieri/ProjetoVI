import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Footer from '../../componentes/footer';
import { firestore, auth } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function MyEventsScreen() {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchMyEvents = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No user logged in');
        setLoading(false);
        return;
      }

      const eventsRef = collection(firestore, 'events');
      const q = query(eventsRef, where('guests', 'array-contains', currentUser.uid));
      const querySnapshot = await getDocs(q);

      const fetchedEvents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMyEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMyEvents();
    }, [])
  );

  const navigateToEventDetails = (eventId) => {
    navigation.navigate('EventDetails', { eventId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Eventos</Text>
        <TouchableOpacity>
          <Icon name="options-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {myEvents.length > 0 ? (
          myEvents.map((event) => (
            <TouchableOpacity 
              key={event.id} 
              style={styles.eventCard}
              onPress={() => navigateToEventDetails(event.id)}
            >
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.name}</Text>
                <Text style={styles.eventDate}>
                  {event.eventDate ? new Date(event.eventDate.toDate()).toLocaleDateString() : 'Data não especificada'}
                </Text>
              </View>
              <View style={styles.eventRole}>
                <Text style={styles.eventRoleText}>
                  {event.attendees && event.attendees.includes(auth.currentUser.uid) ? 'Confirmado' : 'Convidado'}
                </Text>
              </View>
              <Icon name="chevron-forward-outline" size={20} color="#666" />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noEventsText}>Você não tem eventos como convidado.</Text>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateEvent')}
      >
        <Icon name="add" size={24} color="#FFF" />
      </TouchableOpacity>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  eventRole: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  eventRoleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});