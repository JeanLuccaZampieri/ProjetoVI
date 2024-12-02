import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import './src/firebaseConfig';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import LoginScreen from './src/pages/login/login';
import SignUpScreen from './src/pages/cadastroUsuario/CadastroUsuario';
import HomeScreen from './src/pages/home/home';
import AgendaScreen from './src/pages/agenda/agenda';
import SearchScreen from './src/pages/pesquisa/pesquisa';
import MyEventsScreen from './src/pages/meusEventos/MeusEventos';
import ForgotPasswordScreen from './src/pages/esqueciSenha/EsqueciSenha';
import CreateEventScreen from './src/pages/cadastrarEvento/CadastrarEvento';
import EventosCriados from './src/pages/eventosCriados/EventosCriados'
import EditEventScreen from './src/pages/editarEventos/EditarEventos';
import EventDetailsScreen from './src/pages/detalhesEvento/detalhesEvento';
import AdmTela from './src/pages/admTela/admTela';
import EventoAdm from './src/pages/eventoAdm/eventoAdm';
import UsuarioAdm from './src/pages/usuarioAdm/usuarioAdm';
import AdmEditarEvento from './src/pages/AdmEditarEvento/AdmEditarEvento';
import EditUserScreen from './src/pages/AdmEditarUsuario/AdmEditarUsuario';
import AttendeeListScreen from './src/pages/listaConvidados/ListaConvidados';
import Termos from './src/componentes/termos';
const Stack = createStackNavigator();

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="EsqueciSenha" component={ForgotPasswordScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Agenda" component={AgendaScreen} />
            <Stack.Screen name="Pesquisar" component={SearchScreen} />
            <Stack.Screen name="MeusEventos" component={MyEventsScreen} />
            <Stack.Screen name="CadastrarEvento" component={CreateEventScreen} />
            <Stack.Screen name="EventosCriados" component={EventosCriados} />
            <Stack.Screen name="EditarEventos" component={EditEventScreen} />
            <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
            <Stack.Screen name="AdmTela" component={AdmTela} />
            <Stack.Screen name="EventoAdm" component={EventoAdm} />
            <Stack.Screen name="UsuarioAdm" component={UsuarioAdm} />
            <Stack.Screen name="AdmEditarEvento" component={AdmEditarEvento} />
            <Stack.Screen name="EditUser" component={EditUserScreen} />
            <Stack.Screen name="Termos" component={Termos} />
            <Stack.Screen
              name="AttendeeList"
              component={AttendeeListScreen}
              options={{
                title: 'Lista de Presença',
                headerShown: true,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
});