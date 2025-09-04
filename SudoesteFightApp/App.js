// App.js
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { AuthProvider } from "./context/AuthContext"; // Importa o AuthProvider

import LoginScreen from "./telas/TelaLogin";
import TelaPrincipal from "./telas/TelaPrincipal"; // Importa a nova tela principal
import BarraLateral from "./componentes/BarraLateral"; // Importa a barra lateral customizada

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Este é o navegador principal após o login.
// Ele usa a BarraLateral customizada e contém a TelaPrincipal (com as abas).
function MainNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <BarraLateral {...props} />}
      screenOptions={{
         headerStyle: { backgroundColor: '#111' }, // Estilo do cabeçalho
         headerTintColor: '#FFD700', // Cor do ícone do menu e título
         headerTitleAlign: 'center',
      }}
    >
      <Drawer.Screen 
        name="Inicio" 
        component={TelaPrincipal} 
        options={{ title: 'Sudoeste Fight' }} // Título que aparece no topo
      />
    </Drawer.Navigator>
  );
}

// Esta é a função principal e única do seu App.js
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}