import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { firestore } from '../../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';

export default function AttendeeListScreen({ route }) {
  const { eventId } = route.params;
  const [attendees, setAttendees] = useState([]);
  const [filteredAttendees, setFilteredAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAttendees();
  }, []);

  useEffect(() => {
    filterAttendees();
  }, [searchQuery, attendees]);

  const fetchAttendees = async () => {
    try {
      const eventDoc = await getDoc(doc(firestore, 'events', eventId));
      if (!eventDoc.exists()) {
        console.error('Event not found');
        setLoading(false);
        return;
      }

      const attendeeIds = eventDoc.data().attendees || [];
      const attendeePromises = attendeeIds.map(id => 
        getDoc(doc(firestore, 'users', id))
      );

      const attendeeDocs = await Promise.all(attendeePromises);
      const attendeeData = attendeeDocs
        .filter(doc => doc.exists())
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

      setAttendees(attendeeData);
      setFilteredAttendees(attendeeData);
    } catch (error) {
      console.error('Error fetching attendees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAttendees = () => {
    const filtered = attendees.filter(attendee => 
      attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.cpf.includes(searchQuery)
    );
    setFilteredAttendees(filtered);
  };

  const renderAttendeeItem = ({ item }) => (
    <View style={styles.attendeeCard}>
      <View style={styles.attendeeHeader}>
        <Icon name="person-circle-outline" size={40} color="#007AFF" />
        <View style={styles.attendeeInfo}>
          <Text style={styles.attendeeName}>{item.name}</Text>
          <Text style={styles.attendeeEmail}>{item.email}</Text>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>CPF:</Text>
          <Text style={styles.detailValue}>{item.cpf}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Data de Nascimento:</Text>
          <Text style={styles.detailValue}>{item.birthDate}</Text>
        </View>

        <View style={styles.addressContainer}>
          <Text style={styles.addressTitle}>Endereço:</Text>
          <Text style={styles.addressText}>
            {item.address?.street}, {item.address?.number}
          </Text>
          <Text style={styles.addressText}>
            {item.address?.neighborhood}, {item.address?.city}
          </Text>
          <Text style={styles.addressText}>CEP: {item.address?.cep}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando participantes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Presença</Text>
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar participantes"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredAttendees}
        renderItem={renderAttendeeItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? 'Nenhum participante encontrado.' : 'Nenhum participante confirmado ainda.'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  attendeeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attendeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  attendeeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  attendeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  attendeeEmail: {
    fontSize: 14,
    color: '#666',
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 140,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  addressContainer: {
    marginTop: 8,
  },
  addressTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
});