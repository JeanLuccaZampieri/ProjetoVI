import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import './src/firebaseConfig';

import ForgotPasswordScreen from './src/pages/esqueciSenha/EsqueciSenha';
import SignUpScreen from './src/pages/cadastroUsuario/CadastroUsuario';
import HomeScreen from './src/pages/home/home';
import AgendaScreen from './src/pages/agenda/agenda';
import SearchScreen from './src/pages/pesquisa/pesquisa';
import LoginScreen from './src/pages/login/login';
import MyEventsScreen from './src/pages/meusEventos/MeusEventos';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Agenda" component={AgendaScreen} />
        <Stack.Screen name="Pesquisar" component={SearchScreen} />
        <Stack.Screen name="MeusEventos" component={MyEventsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}