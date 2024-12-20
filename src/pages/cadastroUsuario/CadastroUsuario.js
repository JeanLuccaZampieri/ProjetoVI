import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { auth, firestore } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import TermsOfUseModal from '../../componentes/termos';

const SignUpScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cep, setCep] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const navigation = useNavigation();

  const handleSignUp = () => {
    if (!name || !email || !password || !cpf || !birthDate || !cep || !city || !neighborhood || !street || !number) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (!lgpdAccepted) {
      Alert.alert('Erro', 'Por favor, aceite os termos de LGPD para continuar');
      return;
    }

    setShowTermsModal(true);
  };

  const handleAcceptTerms = async () => {
    setShowTermsModal(false);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(firestore, 'users', user.uid), {
        name,
        email,
        cpf,
        birthDate,
        address: {
          cep,
          city,
          neighborhood,
          street,
          number
        },
        createdAt: serverTimestamp(),
        tipo: 1,
        lgpdAccepted: true,
        termsAccepted: true
      });

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error during sign up:', error);
      Alert.alert('Erro', error.message);
    }
  };

  const handleDeclineTerms = () => {
    setShowTermsModal(false);
    Alert.alert('Termos Recusados', 'Você precisa aceitar os termos para se cadastrar.');
  };

  const maskBirthDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = '';
    
    if (cleaned.length <= 2) {
      formatted = cleaned;
    } else if (cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }

    return formatted;
  };

  const handleBirthDateChange = (text) => {
    const formatted = maskBirthDate(text);
    setBirthDate(formatted);
  };

  const searchCep = async () => {
    if (cep.length !== 8) {
      Alert.alert('Erro', 'Por favor, insira um CEP válido com 8 dígitos.');
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        Alert.alert('Erro', 'CEP não encontrado. Por favor, verifique o número e tente novamente.');
      } else {
        setCity(data.localidade);
        setNeighborhood(data.bairro);
        setStreet(data.logradouro);
      }
    } catch (error) {
      console.error('Error fetching CEP:', error);
      Alert.alert('Erro', 'Não foi possível buscar o CEP. Por favor, tente novamente mais tarde.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <View style={styles.inputContainer}>
        <Icon name="person-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="mail-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock-closed-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="card-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="CPF"
          value={cpf}
          onChangeText={setCpf}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="calendar-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Data de nascimento (dd/mm/yyyy)"
          value={birthDate}
          onChangeText={handleBirthDateChange}
          keyboardType="numeric"
          maxLength={10}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="location-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="CEP"
          value={cep}
          onChangeText={setCep}
          keyboardType="numeric"
        />
        <TouchableOpacity onPress={searchCep}>
          <Icon name="search-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="business-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Cidade"
          value={city}
          onChangeText={setCity}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="home-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Bairro"
          value={neighborhood}
          onChangeText={setNeighborhood}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="map-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Rua"
          value={street}
          onChangeText={setStreet}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="home-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Número"
          value={number}
          onChangeText={setNumber}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.lgpdContainer}>
        <Switch
          value={lgpdAccepted}
          onValueChange={setLgpdAccepted}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={lgpdAccepted ? "#f5dd4b" : "#f4f3f4"}
        />
        <Text style={styles.lgpdText}>
          Eu li e aceito os termos da Lei Geral de Proteção de Dados (LGPD). Entendo que meus dados pessoais serão coletados e processados de acordo com a política de privacidade da empresa.
        </Text>
      </View>

      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.signUpButtonText}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLinkText}>Já tem uma conta? Faça login</Text>
      </TouchableOpacity>

      <TermsOfUseModal
        visible={showTermsModal}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
  },
  lgpdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  lgpdText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    color: '#666',
  },
  signUpButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
  },
  loginLinkText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default SignUpScreen;