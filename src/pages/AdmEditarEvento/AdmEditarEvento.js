import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { firestore } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AdminEditEventScreen() {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [items, setItems] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [entryFee, setEntryFee] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params;

  useEffect(() => {
    fetchEventDetails();
  }, []);

  const fetchEventDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!eventId) {
        throw new Error('ID do evento não fornecido');
      }
      const eventRef = doc(firestore, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        setEventName(eventData.name || '');
        setDescription(eventData.description || '');
        setCategory(eventData.category || '');
        setBudget(eventData.budget ? eventData.budget.toString() : '');
        setItems(Array.isArray(eventData.items) ? eventData.items.join(', ') : '');
        setIsPrivate(eventData.isPrivate || false);
        setDate(eventData.eventDate ? eventData.eventDate.toDate() : new Date());
        setEntryFee(eventData.entryFee ? eventData.entryFee.toString() : '');
        setOrganizer(eventData.organizer || '');
        setStatus(eventData.status || 'Pendente');
      } else {
        throw new Error('Evento não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do evento:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!eventName || !description || !budget || !date || !category || !organizer || !status) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const eventRef = doc(firestore, 'events', eventId);
      await updateDoc(eventRef, {
        name: eventName,
        description,
        category,
        budget: parseFloat(budget),
        entryFee: entryFee ? parseFloat(entryFee) : null,
        items: items.split(',').map(item => item.trim()),
        isPrivate,
        eventDate: date,
        organizer,
        status,
        updatedAt: new Date()
      });
      Alert.alert('Sucesso', 'Evento atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o evento. Tente novamente.');
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const renderInputField = (icon, placeholder, value, onChangeText, keyboardType = 'default') => (
    <View style={styles.inputContainer}>
      <Icon name={icon} size={24} color="#666" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando detalhes do evento...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>Erro ao carregar o evento: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchEventDetails}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Evento (Admin)</Text>

      <FlatList
        data={[
          { key: 'name', icon: 'calendar-outline', placeholder: 'Nome do evento', value: eventName, onChangeText: setEventName },
          { key: 'category', icon: 'pricetag-outline', placeholder: 'Categoria do evento', value: category, onChangeText: setCategory },
          { key: 'description', icon: 'document-text-outline', placeholder: 'Descrição', value: description, onChangeText: setDescription },
          { key: 'budget', icon: 'cash-outline', placeholder: 'Orçamento', value: budget, onChangeText: setBudget, keyboardType: 'numeric' },
          { key: 'entryFee', icon: 'ticket-outline', placeholder: 'Valor da entrada (opcional)', value: entryFee, onChangeText: setEntryFee, keyboardType: 'numeric' },
          { key: 'items', icon: 'list-outline', placeholder: 'Itens do evento (separados por vírgula)', value: items, onChangeText: setItems },
          { key: 'organizer', icon: 'person-outline', placeholder: 'Organizador', value: organizer, onChangeText: setOrganizer },
          { key: 'status', icon: 'flag-outline', placeholder: 'Status do evento', value: status, onChangeText: setStatus },
        ]}
        renderItem={({ item }) => renderInputField(item.icon, item.placeholder, item.value, item.onChangeText, item.keyboardType)}
        keyExtractor={item => item.key}
        ListHeaderComponent={
          <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
            <Icon name="calendar" size={24} color="#666" style={styles.inputIcon} />
            <Text style={styles.datePickerButtonText}>
              {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdateEvent}>
            <Text style={styles.updateButtonText}>Atualizar Evento</Text>
          </TouchableOpacity>
        }
      />

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});