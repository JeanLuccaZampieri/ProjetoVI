import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Footer from '../../componentes/footer';
import { firestore } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(firestore, 'events');
      const q = query(
        eventsRef,
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedEvents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const filteredEvents = events.filter(event => {
    const lowercaseQuery = searchQuery.toLowerCase();
    return (
      (event.name && event.name.toLowerCase().includes(lowercaseQuery)) ||
      (event.category && event.category.toLowerCase().includes(lowercaseQuery))
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pesquisar Eventos</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por evento ou categoria"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content}>
        {filteredEvents.map((event) => (
          <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event.name || 'Evento sem nome'}</Text>
              <Text style={styles.eventDate}>
                {event.eventDate && event.eventDate.toDate
                  ? new Date(event.eventDate.toDate()).toLocaleDateString()
                  : 'Data não especificada'}
              </Text>
            </View>
            <View style={styles.eventCategory}>
              <Text style={styles.eventCategoryText}>{event.category || 'Sem categoria'}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  eventCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  eventCategory: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  eventCategoryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});