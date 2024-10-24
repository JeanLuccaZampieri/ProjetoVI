import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { firestore, auth } from '../../firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const CreateEventScreen = () => {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [items, setItems] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [guests, setGuests] = useState([]);
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleCreateEvent = async () => {
    if (!eventName || !description || !budget) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const eventData = {
        name: eventName,
        description,
        budget: parseFloat(budget),
        items: items.split(',').map(item => item.trim()),
        isPrivate,
        guests: selectedGuests,
        createdBy: auth.currentUser.uid,
        createdAt: new Date()
      };

      await addDoc(collection(firestore, 'events'), eventData);
      Alert.alert('Sucesso', 'Evento criado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Erro', 'Não foi possível criar o evento. Tente novamente.');
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Criar Novo Evento</Text>

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

      <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
        <Text style={styles.createButtonText}>Criar Evento</Text>
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
  createButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateEventScreen;