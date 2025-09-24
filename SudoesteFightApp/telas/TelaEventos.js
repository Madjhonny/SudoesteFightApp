import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native'; // Hook para detetar quando o ecrã está focado
import { useNotification } from '../context/NotificationContext'; // Hook do nosso contexto de notificação

const API_URL = "http://172.16.10.208:3000"; // Confirme se o IP está correto

const AvisoItem = ({ item }) => (
  <View style={styles.avisoContainer}>
    <Text style={styles.avisoTitulo}>{item.titulo}</Text>
    <Text style={styles.avisoMensagem}>{item.mensagem}</Text>
    <Text style={styles.avisoData}>
      {new Date(item.data_postagem).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
    </Text>
  </View>
);

export default function TelaEventos() {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // 1. Acede às funções do nosso contexto de notificação
  const { checkForUpdates, markUpdatesAsSeen } = useNotification();

  const fetchAvisos = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/avisos`);
      setAvisos(response.data);
      // 2. Após descarregar os avisos, verifica se há novos
      checkForUpdates(response.data);
    } catch (error) {
      console.error("Erro ao buscar avisos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [checkForUpdates]); // Adiciona checkForUpdates como dependência

  useEffect(() => {
    fetchAvisos();
  }, [fetchAvisos]);

  // 3. O 'useFocusEffect' executa o código sempre que o utilizador entra neste ecrã
  useFocusEffect(
    useCallback(() => {
      // Marca as atualizações como vistas, limpando a notificação
      markUpdatesAsSeen();
    }, [markUpdatesAsSeen])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAvisos();
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#FFD700" /></View>;
  }

  return (
    <FlatList
      style={styles.container}
      data={avisos}
      renderItem={({ item }) => <AvisoItem item={item} />}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={<Text style={styles.emptyText}>Nenhum aviso no momento.</Text>}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />}
    />
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    listContent: { padding: 15, paddingTop: 20 },
    centered: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    avisoContainer: {
        backgroundColor: '#1e1e1e',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderLeftWidth: 5,
        borderLeftColor: '#FFD700',
    },
    avisoTitulo: { color: '#FFD700', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    avisoMensagem: { color: '#fff', fontSize: 16, lineHeight: 22, marginBottom: 10 },
    avisoData: { color: '#888', fontSize: 12, fontStyle: 'italic', textAlign: 'right' },
    emptyText: { color: '#888', textAlign: 'center', marginTop: 50, fontSize: 16 },
});

