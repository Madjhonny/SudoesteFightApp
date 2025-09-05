import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import TelaAgenda from './TelaAgenda';
import TelaEventos from './TelaEventos';
import { useNotification } from '../context/NotificationContext'; // 1. Importa o hook de notificação

const Tab = createMaterialTopTabNavigator();

// 2. Cria um componente customizado para o rótulo da aba "Eventos"
const EventosTabLabel = () => {
  const { hasNewUpdate } = useNotification(); // 3. Acede ao estado que diz se há novas atualizações
  return (
    <View style={styles.tabContainer}>
      <Text style={styles.tabLabel}>Eventos</Text>
      {/* 4. Se 'hasNewUpdate' for verdadeiro, mostra o marcador */}
      {hasNewUpdate && <View style={styles.badge} />}
    </View>
  );
};

export default function TelaPrincipal() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#111' },
        tabBarLabelStyle: { color: '#fff', fontWeight: 'bold' },
        tabBarIndicatorStyle: { backgroundColor: '#FFD700' },
      }}
    >
      <Tab.Screen name="Agenda" component={TelaAgenda} />
      <Tab.Screen 
        name="Eventos e Atualizações" 
        component={TelaEventos}
        // 5. Usa o nosso componente de rótulo customizado para esta aba
        options={{ tabBarLabel: () => <EventosTabLabel /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  tabLabel: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  badge: {
    backgroundColor: '#FFD700',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});

