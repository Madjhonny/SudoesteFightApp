import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from './context/NotificationContext';

// Importa todas as telas
import LoginScreen from "./telas/TelaLogin";
import TelaPrincipal from "./telas/TelaPrincipal";
import BarraLateral from "./componentes/BarraLateral";
import PainelProfessor from "./telas/PainelProfessor";
import GerenciarEventos from "./telas/GerenciarEventos";
import GerenciarAgenda from "./telas/GerenciarAgenda"; // <-- Nova tela importada

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function MainNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <BarraLateral {...props} />}
      screenOptions={{
         headerStyle: { backgroundColor: '#111' },
         headerTintColor: '#FFD700',
         headerTitleAlign: 'center',
      }}
    >
      <Drawer.Screen 
        name="Inicio" 
        component={TelaPrincipal} 
        options={{ title: 'Sudoeste Fight' }}
      />
    </Drawer.Navigator>
  );
}

const headerStyle = {
  headerStyle: { backgroundColor: '#111' },
  headerTintColor: '#FFD700',
  headerTitleAlign: 'center',
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="Main" component={MainNavigator} options={{ headerShown: false }}/>
            <Stack.Screen name="PainelProfessor" component={PainelProfessor} options={{ title: 'Painel do Professor', ...headerStyle }}/>
            <Stack.Screen name="GerenciarEventos" component={GerenciarEventos} options={{ title: 'Gerir Eventos', ...headerStyle }}/>
            {/* 👇 Nova tela registada no navegador */}
            <Stack.Screen name="GerenciarAgenda" component={GerenciarAgenda} options={{ title: 'Gerir Agenda', ...headerStyle }}/>
          </Stack.Navigator>
        </NavigationContainer>
      </NotificationProvider>
    </AuthProvider>
  );
}

