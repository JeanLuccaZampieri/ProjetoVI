import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { firestore } from '../../firebaseConfig';
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminUserManagementScreen() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef);
            const querySnapshot = await getDocs(q);
            const fetchedUsers = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(fetchedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            Alert.alert('Erro', 'Não foi possível carregar os usuários.');
        }
    };

    const handleEditUser = (user) => {
        navigation.navigate('EditUser', { user });
    };

    const handleDeleteUser = async (userId) => {
        try {
            await deleteDoc(doc(firestore, 'users', userId));
            Alert.alert('Sucesso', 'Usuário excluído com sucesso.');
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Error deleting user:', error);
            Alert.alert('Erro', 'Não foi possível excluir o usuário.');
        }
    };

    const renderUserItem = ({ item }) => (
        <View style={styles.userItem}>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
            </View>
            <View style={styles.userActions}>
                <TouchableOpacity onPress={() => handleEditUser(item)} style={styles.editButton}>
                    <Icon name="create-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteUser(item.id)} style={styles.deleteButton}>
                    <Icon name="trash-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Gerenciar Usuários</Text>
            </View>
            <View style={styles.searchContainer}>
                <Icon name="search-outline" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar usuários"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                style={styles.userList}
            />
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
    userList: {
        flex: 1,
    },
    userItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    userActions: {
        flexDirection: 'row',
    },
    editButton: {
        marginRight: 16,
    },
    deleteButton: {
        marginLeft: 16,
    },
});