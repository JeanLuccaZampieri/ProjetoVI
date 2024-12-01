import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { firestore } from '../../firebaseConfig';
import { collection, query, getDocs, doc, deleteDoc, where } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AdminEventManagementScreen() {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [entryFeeFilter, setEntryFeeFilter] = useState('');
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let eventsQuery = query(collection(firestore, 'events'));

      if (categoryFilter) {
        eventsQuery = query(eventsQuery, where('category', '==', categoryFilter));
      }

      if (entryFeeFilter) {
        eventsQuery = query(eventsQuery, where('entryFee', '<=', parseFloat(entryFeeFilter)));
      }

      if (!showPastEvents) {
        eventsQuery = query(eventsQuery, where('eventDate', '>=', new Date()));
      }

      if (startDate) {
        eventsQuery = query(eventsQuery, where('eventDate', '>=', startDate));
      }

      if (endDate) {
        eventsQuery = query(eventsQuery, where('eventDate', '<=', endDate));
      }

      const querySnapshot = await getDocs(eventsQuery);
      const fetchedEvents = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          eventDate: data.eventDate ? data.eventDate.toDate() : null,
          name: data.name || 'Evento sem nome'
        };
      });
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os eventos.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event) => {
    if (event && event.id) {
      navigation.navigate('EditarEventos', { eventId: event.id });
    } else {
      Alert.alert('Erro', 'Não foi possível editar este evento.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!eventId) {
      Alert.alert('Erro', 'ID do evento inválido.');
      return;
    }
    try {
      await deleteDoc(doc(firestore, 'events', eventId));
      Alert.alert('Sucesso', 'Evento excluído com sucesso.');
      fetchEvents();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      Alert.alert('Erro', 'Não foi possível excluir o evento.');
    }
  };

  const renderEventItem = ({ item }) => (
    <View style={styles.eventItem}>
      <View style={styles.eventInfo}>
        <Text style={styles.eventName}>{item.name}</Text>
        <Text style={styles.eventDate}>
          {item.eventDate
            ? item.eventDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : 'Data não especificada'}
        </Text>
        <Text style={styles.eventCategory}>{item.category || 'Categoria não especificada'}</Text>
      </View>
      <View style={styles.eventActions}>
        <TouchableOpacity onPress={() => handleEditEvent(item)} style={styles.editButton}>
          <Icon name="create-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteEvent(item.id)} style={styles.deleteButton}>
          <Icon name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const applyFilters = () => {
    setShowFilters(false);
    fetchEvents();
  };

  const resetFilters = () => {
    setCategoryFilter('');
    setEntryFeeFilter('');
    setShowPastEvents(false);
    setStartDate(null);
    setEndDate(null);
    setShowFilters(false);
    fetchEvents();
  };

  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gerenciar Eventos</Text>
      </View>
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar eventos"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
          <Icon name="options-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          style={styles.eventList}
        />
      )}

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
                  {startDate ? startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Data inicial'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndDatePicker(true)}>
                <Text style={styles.dateButtonText}>
                  {endDate ? endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Data final'}
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
              <TouchableOpacity style={styles.modalButton} onPress={() => {
                setShowFilters(false);
                fetchEvents();
              }}>
                <Text style={styles.modalButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 4,
  },
  eventList: {
    flex: 1,
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
  },
  eventCategory: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  eventActions: {
    flexDirection: 'row',
  },
  editButton: {
    marginRight: 16,
  },
  deleteButton: {
    marginLeft: 16,
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  filterItem: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    padding: 10,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    flex:1,
    marginHorizontal: 5,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  filterButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#FF3B30',
  },
  filterButtonText: {
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
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateButtonText: {
    textAlign: 'center',
  },
});