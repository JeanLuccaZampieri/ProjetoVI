import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Footer from '../../componentes/footer';
import { firestore } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [entryFeeFilter, setEntryFeeFilter] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, searchQuery, categoryFilter, showPastEvents, startDate, endDate, entryFeeFilter]);

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(firestore, 'events');
      const q = query(eventsRef, where('isActive', '==', true));
      
      const querySnapshot = await getDocs(q);
      const fetchedEvents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        eventDate: doc.data().eventDate ? doc.data().eventDate.toDate() : null
      }));
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const applyFilters = () => {
    let filtered = events;

    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        (event.name && event.name.toLowerCase().includes(lowercaseQuery)) ||
        (event.category && event.category.toLowerCase().includes(lowercaseQuery))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(event => 
        event.category && event.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    if (!showPastEvents) {
      const now = new Date();
      filtered = filtered.filter(event => event.eventDate && event.eventDate > now);
    }

    if (startDate && endDate) {
      filtered = filtered.filter(event => {
        if (!event.eventDate) return false;
        return event.eventDate >= startDate && event.eventDate <= endDate;
      });
    }

    if (entryFeeFilter) {
      const maxFee = parseFloat(entryFeeFilter);
      filtered = filtered.filter(event => {
        const eventFee = event.entryFee ? parseFloat(event.entryFee) : 0;
        return eventFee <= maxFee;
      });
    }

    setFilteredEvents(filtered);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    setCategoryFilter('');
    setShowPastEvents(false);
    setStartDate(null);
    setEndDate(null);
    setEntryFeeFilter('');
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

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
        <TouchableOpacity onPress={toggleFilters} style={styles.filterButton}>
          <Icon name="options-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtros</Text>
            
            <Text style={styles.filterLabel}>Categoria:</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Filtrar por categoria"
              value={categoryFilter}
              onChangeText={setCategoryFilter}
            />

            <Text style={styles.filterLabel}>Valor máximo da entrada:</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Valor máximo"
              value={entryFeeFilter}
              onChangeText={setEntryFeeFilter}
              keyboardType="numeric"
            />

            <View style={styles.switchContainer}>
              <Text style={styles.filterLabel}>Mostrar eventos passados:</Text>
              <Switch
                value={showPastEvents}
                onValueChange={setShowPastEvents}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={showPastEvents ? "#f5dd4b" : "#f4f3f4"}
              />
            </View>

            <Text style={styles.filterLabel}>Período do evento:</Text>
            <View style={styles.dateContainer}>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartDatePicker(true)}>
                <Text style={styles.dateButtonText}>
                  {startDate ? startDate.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'}) : 'Data inicial'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndDatePicker(true)}>
                <Text style={styles.dateButtonText}>
                  {endDate ? endDate.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'}) : 'Data final'}
                </Text>
              </TouchableOpacity>
            </View>

            {showStartDatePicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={onStartDateChange}
              />
            )}

            {showEndDatePicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display="default"
                onChange={onEndDateChange}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#007AFF' }]} onPress={resetFilters}>
                <Text style={styles.modalButtonText}>Retirar filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setShowFilters(false)}>
                <Text style={styles.modalButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.content}>
        {filteredEvents.map((event) => (
          <TouchableOpacity 
            key={event.id} 
            style={styles.eventCard} 
            onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
          >
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event.name || 'Evento sem nome'}</Text>
              <Text style={styles.eventDate}>
                {event.eventDate
                  ? event.eventDate.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'})
                  : 'Data não especificada'}
              </Text>
              {event.entryFee && (
                <Text style={styles.eventEntryFee}>
                  Entrada: R$ {parseFloat(event.entryFee).toFixed(2)}
                </Text>
              )}
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
    marginRight: 10,
  },
  filterButton: {
    padding: 8,
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
  eventEntryFee: {
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  dateButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});