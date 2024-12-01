import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Agenda, LocaleConfig } from 'react-native-calendars';
import Footer from '../../componentes/footer';
import { firestore, auth } from '../../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

LocaleConfig.locales['pt-br'] = {
  monthNames: meses,
  monthNamesShort: meses.map(mes => mes.slice(0, 3)),
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: diasDaSemana,
};
LocaleConfig.defaultLocale = 'pt-br';

const CustomDayHeader = ({ date }) => {
  const dia = new Date(date).getDay();
  return <Text style={styles.dayHeader}>{diasDaSemana[dia]}</Text>;
};

const CustomMonthHeader = ({ date }) => {
  const mes = new Date(date).getMonth();
  const ano = new Date(date).getFullYear();
  return <Text style={styles.monthHeader}>{`${meses[mes]} ${ano}`}</Text>;
};

export default function AgendaScreen() {
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const buscarEventosConfirmados = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('Nenhum usuário logado');
        setLoading(false);
        return;
      }

      const eventsRef = collection(firestore, 'events');
      const q = query(eventsRef, where('attendees', 'array-contains', currentUser.uid));
      const querySnapshot = await getDocs(q);

      const fetchedEvents = {};
      const now = new Date();

      querySnapshot.docs.forEach(doc => {
        const eventData = doc.data();
        if (eventData.eventDate && eventData.eventDate.toDate) {
          const date = eventData.eventDate.toDate().toISOString().split('T')[0];
          if (!fetchedEvents[date]) {
            fetchedEvents[date] = [];
          }
          fetchedEvents[date].push({
            id: doc.id,
            name: eventData.name || 'Evento sem nome',
            time: eventData.eventDate.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            date: date,
            isPast: eventData.eventDate.toDate() < now,
            rating: eventData.rating || 0
          });
        }
      });

      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Erro ao buscar eventos confirmados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      buscarEventosConfirmados();
    }, [buscarEventosConfirmados])
  );

  const navegarParaDetalhesDoEvento = (eventId) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const lidarComAvaliacao = async (eventId, rating) => {
    try {
      const eventRef = doc(firestore, 'events', eventId);
      await updateDoc(eventRef, { rating });
      Alert.alert('Sucesso', 'Avaliação salva com sucesso!');
      buscarEventosConfirmados(); // Recarrega os eventos para atualizar a avaliação
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      Alert.alert('Erro', 'Não foi possível salvar a avaliação. Tente novamente.');
    }
  };

  const renderizarItem = (item) => {
    const eventDate = new Date(item.date);
    const day = eventDate.getDate();

    return (
      <TouchableOpacity
        style={styles.eventItem}
        onPress={() => navegarParaDetalhesDoEvento(item.id)}
      >
        <View style={styles.eventDay}>
          <Text style={styles.eventDayText}>{day}</Text>
        </View>
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>{item.name}</Text>
          <Text style={styles.eventTime}>{item.time}</Text>
          {item.isPast && (
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => lidarComAvaliacao(item.id, star)}
                >
                  <Icon
                    name={star <= item.rating ? 'star' : 'star-outline'}
                    size={20}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agenda</Text>
      </View>

      <Agenda
        items={events}
        renderItem={renderizarItem}
        renderEmptyDate={() => <View style={styles.emptyDate}><Text>Nenhum evento</Text></View>}
        rowHasChanged={(r1, r2) => r1.name !== r2.name}
        showClosingKnob={true}
        renderDay={(day, item) => <CustomDayHeader date={day?.timestamp} />}
        renderHeader={(date) => <CustomMonthHeader date={date} />}
        theme={{
          agendaDayTextColor: '#007AFF',
          agendaDayNumColor: '#007AFF',
          agendaTodayColor: '#007AFF',
          agendaKnobColor: '#007AFF',
          selectedDayBackgroundColor: '#007AFF',
          dotColor: '#007AFF',
          todayTextColor: '#007AFF',
          'stylesheet.calendar.header': {
            dayTextAtIndex0: {
              color: 'red'
            },
            dayTextAtIndex6: {
              color: 'blue'
            }
          }
        }}
      />



      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  eventItem: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDay: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  eventDayText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 80,
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
  dayHeader: {
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  monthHeader: {
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
});