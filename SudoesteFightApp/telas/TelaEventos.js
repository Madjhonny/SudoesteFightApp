// telas/TelaEventos.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TelaEventos() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Eventos e Atualizações em breve...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  texto: {
    color: '#fff',
    fontSize: 18,
  },
});