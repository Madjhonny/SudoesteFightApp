// telas/TelaPrincipal.js
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import TelaAgenda from './TelaAgenda';
import TelaEventos from './TelaEventos';

const Tab = createMaterialTopTabNavigator();

export default function TelaPrincipal() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#111' }, // Cor de fundo da barra de abas
        tabBarLabelStyle: { color: '#fff', fontWeight: 'bold' }, // Estilo do texto da aba
        tabBarIndicatorStyle: { backgroundColor: '#FFD700' }, // Cor do indicador da aba selecionada
      }}
    >
      <Tab.Screen name="Agenda" component={TelaAgenda} />
      <Tab.Screen name="Eventos e Atualizações" component={TelaEventos} />
    </Tab.Navigator>
  );
}