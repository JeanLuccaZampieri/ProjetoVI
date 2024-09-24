import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image } from "react-native";
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import CadastroUsuario from "./src/pages/cadastroUsuario/Index";
import { firestore } from './src/firebaseConfig';
const Stack = createStackNavigator();

export default function App() {



  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CadastroUsuario">
        <Stack.Screen
          name="CadastroUsuario"
          options={{ headerShown: false, headerLeft: null }}
          component={CadastroUsuario}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



