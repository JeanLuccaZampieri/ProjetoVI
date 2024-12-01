import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, FlatList, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { firestore, auth } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditEventScreen = () => {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(''); 
  const [budget, setBudget] = useState('');
  const [items, setItems] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [guests, setGuests] = useState([]);
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [entryFee, setEntryFee] = useState(''); 

  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params;

  useEffect(() => {
    fetchEventDetails();
    fetchUsers();
  }, []);

  const fetchEventDetails = async () => {
    try {
      const eventRef = doc(firestore, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        setEventName(eventData.name);
        setDescription(eventData.description);
        setCategory(eventData.category || ''); // Set category
        setBudget(eventData.budget.toString());
        setItems(eventData.items.join(', '));
        setIsPrivate(eventData.isPrivate);
        setSelectedGuests(eventData.guests || []);
        setDate(eventData.eventDate ? eventData.eventDate.toDate() : new Date());
        setEntryFee(eventData.entryFee ? eventData.entryFee.toString() : ''); // Set entryFee
      } else {
        Alert.alert('Erro', 'Evento não encontrado');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do evento');
    }
  };

  const fetchUsers = async () => {
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '!=', auth.currentUser.email));
      const querySnapshot = await getDocs(q);
      const fetchedUsers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGuests(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Erro', 'Não foi possível carregar os usuários.');
    }
  };

  const handleUpdateEvent = async () => {
    if (!eventName || !description || !budget || !date || !category) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios, incluindo a categoria.');
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
        guests: selectedGuests,
        eventDate: date,
        updatedAt: new Date()
      });
      Alert.alert('Sucesso', 'Evento atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating event:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o evento. Tente novamente.');
    }
  };

  const toggleGuestSelection = (guest) => {
    setSelectedGuests(prevSelected => 
      prevSelected.some(g => g.id === guest.id)
        ? prevSelected.filter(g => g.id !== guest.id)
        : [...prevSelected, guest]
    );
  };

  const filteredGuests = guests.filter(guest => 
    guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar Evento</Text>

      <View style={styles.inputContainer}>
        <Icon name="calendar-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Nome do evento"
          value={eventName}
          onChangeText={setEventName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="pricetag-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Categoria do evento"
          value={category}
          onChangeText={setCategory}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="document-text-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Descrição"
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="cash-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Orçamento"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}> 
        <Icon name="ticket-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Valor da entrada (opcional)"
          value={entryFee}
          onChangeText={setEntryFee}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
        <Icon name="calendar" size={24} color="#666" style={styles.inputIcon} />
        <Text style={styles.datePickerButtonText}>
          {date.toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <View style={styles.inputContainer}>
        <Icon name="list-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Itens do evento (separados por vírgula)"
          value={items}
          onChangeText={setItems}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Evento Privado</Text>
        <Switch
          value={isPrivate}
          onValueChange={setIsPrivate}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isPrivate ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      <Text style={styles.sectionTitle}>Convidados</Text>
      <View style={styles.inputContainer}>
        <Icon name="search-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Buscar convidados"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredGuests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.guestItem,
              selectedGuests.some(g => g.id === item.id) && styles.selectedGuest
            ]}
            onPress={() => toggleGuestSelection(item)}
          >
            <Text style={styles.guestName}>{item.name}</Text>
            <Text style={styles.guestEmail}>{item.email}</Text>
          </TouchableOpacity>
        )}
        style={styles.guestList}
      />

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdateEvent}>
        <Text style={styles.updateButtonText}>Atualizar Evento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  guestList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  guestItem: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  selectedGuest: {
    backgroundColor: '#E3F2FD',
  },
  guestName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestEmail: {
    fontSize: 14,
    color: '#666',
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

export default EditEventScreen;