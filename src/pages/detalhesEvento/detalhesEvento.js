import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { firestore, auth } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const EventDetailsScreen = () => {
  const [event, setEvent] = useState(null);
  const [isAttending, setIsAttending] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params;

  useEffect(() => {
    fetchEventDetails();
  }, []);

  const fetchEventDetails = async () => {
    try {
      const eventRef = doc(firestore, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        // Garantir que todas as propriedades necessárias existam
        setEvent({
          ...eventData,
          eventDate: eventData.eventDate || null,
          budget: eventData.budget || 0,
          items: eventData.items || [],
          isPrivate: eventData.isPrivate || false,
          attendees: eventData.attendees || [],
          guests: eventData.guests || []
        });
        setIsAttending(eventData.attendees?.includes(auth.currentUser.uid) || false);
      } else {
        Alert.alert('Erro', 'Evento não encontrado');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do evento');
    }
  };

  const handleToggleAttendance = async () => {
    try {
      const eventRef = doc(firestore, 'events', eventId);
      const currentUserUid = auth.currentUser.uid;
      
      if (isAttending) {
        await updateDoc(eventRef, {
          attendees: arrayRemove(currentUserUid),
          guests: arrayUnion(currentUserUid)
        });
        setIsAttending(false);
        Alert.alert('Sucesso', 'Você removeu sua confirmação de presença do evento, mas continua como convidado.');
      } else {
        await updateDoc(eventRef, {
          attendees: arrayUnion(currentUserUid),
          guests: arrayUnion(currentUserUid)
        });
        setIsAttending(true);
        Alert.alert('Sucesso', 'Você confirmou sua presença no evento.');
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      Alert.alert('Erro', 'Não foi possível atualizar sua presença. Tente novamente.');
    }
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{event.name}</Text>
      
      <View style={styles.infoContainer}>
        <Icon name="calendar-outline" size={24} color="#666" style={styles.icon} />
        <Text style={styles.infoText}>{new Date(event.eventDate?.toDate()).toLocaleDateString()}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Icon name="cash-outline" size={24} color="#666" style={styles.icon} />
        <Text style={styles.infoText}>
          Orçamento: R$ {event.budget ? event.budget.toFixed(2) : 'Não especificado'}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Icon name="lock-closed-outline" size={24} color="#666" style={styles.icon} />
        <Text style={styles.infoText}>{event.isPrivate ? 'Evento Privado' : 'Evento Público'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Descrição</Text>
      <Text style={styles.description}>{event.description}</Text>

      <Text style={styles.sectionTitle}>Itens do Evento</Text>
      {event.items && event.items.length > 0 ? (
        event.items.map((item, index) => (
          <Text key={index} style={styles.itemText}>• {item}</Text>
        ))
      ) : (
        <Text style={styles.itemText}>Nenhum item especificado</Text>
      )}

      <Text style={styles.sectionTitle}>Seu Status</Text>
      <Text style={styles.statusText}>
        {isAttending ? 'Confirmado' : 'Convidado'}
      </Text>

      <TouchableOpacity
        style={[styles.attendButton, isAttending && styles.attendingButton]}
        onPress={handleToggleAttendance}
      >
        <Text style={styles.attendButtonText}>
          {isAttending ? 'Cancelar Presença' : 'Confirmar Presença'}
        </Text>
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
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  infoText: {
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
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  attendButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  attendingButton: {
    backgroundColor: '#FF3B30',
  },
  attendButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default EventDetailsScreen;