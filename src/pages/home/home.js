import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Footer from '../../componentes/footer';

export default function HomeScreen() {
  const upcomingEvents = [
    { id: 1, title: 'Conferência de Tech', date: '10 Jun' },
    { id: 2, title: 'Workshop de Design', date: '15 Jun' },
    { id: 3, title: 'Meetup de Startups', date: '20 Jun' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Eventive</Text>
        <TouchableOpacity>
          <Icon name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Bem-vindo de volta, Usuário!</Text>
          <Text style={styles.subText}>Vamos gerenciar seus eventos</Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Próximos Eventos</Text>
          {upcomingEvents.map((event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard}>
              <View style={styles.eventDate}>
                <Text style={styles.eventDateText}>{event.date}</Text>
              </View>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Icon name="chevron-forward-outline" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="add-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Criar Evento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="search-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Buscar Eventos</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: 16,
    backgroundColor: '#007AFF',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.8,
  },
  sectionContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 8,
  },
  eventDate: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventDateText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  eventTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionText: {
    marginTop: 8,
    color: '#007AFF',
  },
});