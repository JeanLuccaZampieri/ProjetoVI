import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Footer from '../../componentes/footer';
import { firestore, auth } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function AgendaScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchConfirmedEvents = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No user logged in');
        setLoading(false);
        return;
      }

      const eventsRef = collection(firestore, 'events');
      const q = query(eventsRef, where('attendees', 'array-contains', currentUser.uid));
      const querySnapshot = await getDocs(q);

      const fetchedEvents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort events by date, handling potential undefined dates
      const sortedEvents = fetchedEvents.sort((a, b) => {
        if (!a.eventDate || !a.eventDate.toDate) return 1;
        if (!b.eventDate || !b.eventDate.toDate) return -1;
        return a.eventDate.toDate() - b.eventDate.toDate();
      });

      setEvents(sortedEvents);
    } catch (error) {
      console.error('Error fetching confirmed events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchConfirmedEvents();
    }, [])
  );

  const navigateToEventDetails = (eventId) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const formatEventDate = (date) => {
    if (!date || !date.toDate) return 'Data não definida';
    const eventDate = date.toDate();
    return eventDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const formatEventTime = (date) => {
    if (!date || !date.toDate) return 'Hora não definida';
    const eventDate = date.toDate();
    return eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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
        <Text style={styles.headerTitle}>Agenda</Text>
        <TouchableOpacity>
          <Icon name="calendar-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {events.length > 0 ? (
          events.map((event) => (
            <TouchableOpacity 
              key={event.id} 
              style={styles.eventCard}
              onPress={() => navigateToEventDetails(event.id)}
            >
              <View style={styles.eventDate}>
                <Text style={styles.eventDateText}>{formatEventDate(event.eventDate)}</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{event.name || 'Evento sem nome'}</Text>
                <Text style={styles.eventTime}>{formatEventTime(event.eventDate)}</Text>
              </View>
              <Icon name="chevron-forward-outline" size={20} color="#666" />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noEventsText}>Você não tem eventos confirmados.</Text>
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
  eventDate: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventDateText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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