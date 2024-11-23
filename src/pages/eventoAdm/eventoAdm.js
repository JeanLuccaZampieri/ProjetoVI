import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { firestore } from '../../firebaseConfig';
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminEventManagementScreen() {
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const eventsRef = collection(firestore, 'events');
            const q = query(eventsRef);
            const querySnapshot = await getDocs(q);
            const fetchedEvents = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                eventDate: doc.data().eventDate ? doc.data().eventDate.toDate() : null
            }));
            setEvents(fetchedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
            Alert.alert('Erro', 'Não foi possível carregar os eventos.');
        }
    };

    const handleEditEvent = (event) => {
        navigation.navigate('EditEvent', { event });
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await deleteDoc(doc(firestore, 'events', eventId));
            Alert.alert('Sucesso', 'Evento excluído com sucesso.');
            fetchEvents(); // Refresh the list
        } catch (error) {
            console.error('Error deleting event:', error);
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
            </View>
            <FlatList
                data={filteredEvents}
                renderItem={renderEventItem}
                keyExtractor={(item) => item.id}
                style={styles.eventList}
            />
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('CreateEvent')}
            >
                <Icon name="add" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
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
});