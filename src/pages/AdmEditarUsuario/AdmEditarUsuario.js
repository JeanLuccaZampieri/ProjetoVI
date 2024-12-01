import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { firestore } from '../../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

export default function EditUserScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params;

  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [cpf, setCpf] = useState(user.cpf || '');
  const [birthDate, setBirthDate] = useState(() => {
    if (user.birthDate) {
      const [day, month, year] = user.birthDate.split('/');
      return new Date(year, month - 1, day);
    }
    return new Date();
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [address, setAddress] = useState({
    cep: user.address?.cep || '',
    city: user.address?.city || '',
    neighborhood: user.address?.neighborhood || '',
    number: user.address?.number || '',
    street: user.address?.street || ''
  });
  const [userType, setUserType] = useState(user.tipo || 1);

  const formatCPF = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
    if (match) {
      return !match[2] ? match[1] 
        : !match[3] ? `${match[1]}.${match[2]}`
        : !match[4] ? `${match[1]}.${match[2]}.${match[3]}`
        : `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return text;
  };

  const formatCEP = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,5})(\d{0,3})$/);
    if (match) {
      return !match[2] ? match[1] : `${match[1]}-${match[2]}`;
    }
    return text;
  };

  const handleUpdateUser = async () => {
    if (!name || !email || !cpf) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const userRef = doc(firestore, 'users', user.id);
      await updateDoc(userRef, {
        name,
        email,
        cpf,
        birthDate: format(birthDate, 'dd/MM/yyyy'),
        address: {
          cep: address.cep,
          city: address.city,
          neighborhood: address.neighborhood,
          number: address.number,
          street: address.street
        },
        tipo: userType
      });
      Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o usuário. Tente novamente.');
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const toggleUserType = () => {
    setUserType(prevType => prevType === 1 ? 2 : 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Usuário</Text>
      </View>
      <ScrollView style={styles.form}>
        <View style={styles.inputContainer}>
          <Icon name="person-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="mail-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="card-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="CPF"
            value={cpf}
            onChangeText={(text) => setCpf(formatCPF(text))}
            keyboardType="numeric"
            maxLength={14}
          />
        </View>

        <TouchableOpacity 
          style={styles.inputContainer}
          onPress={() => setShowDatePicker(true)}
        >
          <Icon name="calendar-outline" size={24} color="#666" style={styles.inputIcon} />
          <Text style={styles.dateText}>
            {format(birthDate, 'dd/MM/yyyy')}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <Text style={styles.sectionTitle}>Endereço</Text>

        <View style={styles.inputContainer}>
          <Icon name="location-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="CEP"
            value={address.cep}
            onChangeText={(text) => setAddress({...address, cep: formatCEP(text)})}
            keyboardType="numeric"
            maxLength={9}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="business-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Cidade"
            value={address.city}
            onChangeText={(text) => setAddress({...address, city: text})}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="home-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Bairro"
            value={address.neighborhood}
            onChangeText={(text) => setAddress({...address, neighborhood: text})}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="navigate-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Número"
            value={address.number}
            onChangeText={(text) => setAddress({...address, number: text})}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="map-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Rua"
            value={address.street}
            onChangeText={(text) => setAddress({...address, street: text})}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="shield-outline" size={24} color="#666" style={styles.inputIcon} />
          <Text style={styles.input}>Tipo de Usuário: {userType === 1 ? 'Normal' : 'Administrador'}</Text>
          <TouchableOpacity onPress={toggleUserType} style={styles.toggleButton}>
            <Text style={styles.toggleButtonText}>Alterar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateUser}>
          <Text style={styles.updateButtonText}>Atualizar Usuário</Text>
        </TouchableOpacity>
      </ScrollView>
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 5,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  dateText: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'center',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 5,
  },
  toggleButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});