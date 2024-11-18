import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Footer from '../../componentes/footer';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { firestore, auth } from '../../firebaseConfig';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Usuário');

  const fetchUpcomingEvents = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No user logged in');
        setLoading(false);
        return;
      }

      const eventsRef = collection(firestore, 'events');
      const now = new Date();
      const q = query(
        eventsRef,
        where('attendees', 'array-contains', currentUser.uid),
        where('eventDate', '>=', now),
        limit(3)
      );

      const querySnapshot = await getDocs(q);
      const fetchedEvents = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          eventDate: data.eventDate ? data.eventDate.toDate() : null
        };
      });

      setUpcomingEvents(fetchedEvents);

      // Fetch user name
      const userQuery = query(collection(firestore, 'users'), where('uid', '==', currentUser.uid));
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        setUserName(userSnapshot.docs[0].data().name || 'Usuário');
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      if (error.code === 'failed-precondition') {
        console.error('This query requires an index. Please create it in the Firebase Console.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUpcomingEvents();
    }, [fetchUpcomingEvents])
  );

  const formatEventDate = (date) => {
    if (!date) return 'Data não definida';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Eventive</Text>
        <TouchableOpacity>
          <Icon name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Bem-vindo de volta, {userName}!</Text>
          <Text style={styles.subText}>Vamos gerenciar seus eventos</Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Próximos Eventos</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <TouchableOpacity 
                key={event.id} 
                style={styles.eventCard}
                onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
              >
                <View style={styles.eventDate}>
                  <Text style={styles.eventDateText}>{formatEventDate(event.eventDate)}</Text>
                </View>
                <Text style={styles.eventTitle}>{event.name}</Text>
                <Icon name="chevron-forward-outline" size={20} color="#666" />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noEventsText}>Nenhum evento confirmado próximo.</Text>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('EventosCriados')}>
              <Icon name="add-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Criar Evento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('Search')}>
              <Icon name="search-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Buscar Eventos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  welcomeSection: {
    padding: 16,
    backgroundColor: '#007AFF',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.8,
  },
  sectionContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 8,
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
  eventTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionText: {
    marginTop: 8,
    color: '#007AFF',
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});