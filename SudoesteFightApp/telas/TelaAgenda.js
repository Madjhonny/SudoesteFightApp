import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CheckInModal from '../componentes/CheckInModal';

const API_URL = "http://192.168.100.5:3000";

const diasDaSemana = [
  { abrev: 'Seg', nome: 'Segunda-feira' },
  { abrev: 'Ter', nome: 'Terça-feira' },
  { abrev: 'Qua', nome: 'Quarta-feira' },
  { abrev: 'Qui', nome: 'Quinta-feira' },
  { abrev: 'Sex', nome: 'Sexta-feira' },
  { abrev: 'Sab', nome: 'Sábado' },
];

export default function AgendaScreen() {
  const { user } = useAuth();
  const [diaSelecionado, setDiaSelecionado] = useState("Seg");
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Controles do modal e check-ins
  const [modalVisible, setModalVisible] = useState(false);
  const [aulaSelecionada, setAulaSelecionada] = useState(null);
  const [checkedInAlunos, setCheckedInAlunos] = useState([]);
  const [loadingCheckIns, setLoadingCheckIns] = useState(false);

  // Função para buscar a agenda do backend
  const fetchAgenda = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/agenda`);
      setAulas(response.data);
    } catch (err) {
      setError("Não foi possível carregar a agenda.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  // Pega a data de hoje no formato YYYY-MM-DD
  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  // Busca os check-ins da aula selecionada
  const fetchCheckIns = async (aula) => {
    setLoadingCheckIns(true);
    try {
      const hoje = getTodayDateString();
      const response = await axios.get(`${API_URL}/api/checkins/aula/${aula.id}/data/${hoje}`);
      setCheckedInAlunos(response.data);
    } catch (err) {
      console.error("Erro ao buscar check-ins:", err);
      setCheckedInAlunos([]);
    } finally {
      setLoadingCheckIns(false);
    }
  };

  // Abre o modal e busca os check-ins
  const handleAulaPress = (aula) => {
    setAulaSelecionada(aula);
    setModalVisible(true);
    fetchCheckIns(aula);
  };

  // Lógica para fazer check-in
  const handleCheckIn = async () => {
    try {
      const payload = {
        aluno_id: user.id,
        aula_id: aulaSelecionada.id,
        data_checkin: getTodayDateString(),
      };
      await axios.post(`${API_URL}/api/checkins`, payload);
      Alert.alert('Sucesso', 'Check-in realizado!');
      fetchCheckIns(aulaSelecionada); // Atualiza a lista de alunos
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.error || 'Não foi possível fazer o check-in.');
    }
  };

  // Lógica para cancelar o check-in
  const handleCancelCheckIn = async () => {
    try {
      const payload = {
        aluno_id: user.id,
        aula_id: aulaSelecionada.id,
        data_checkin: getTodayDateString(),
      };
      await axios.delete(`${API_URL}/api/checkins`, { data: payload });
      Alert.alert('Sucesso', 'Check-in cancelado.');
      fetchCheckIns(aulaSelecionada); // Atualiza a lista de alunos
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível cancelar o check-in.');
    }
  };

  const aulasDoDia = aulas
    .filter(aula => aula.dia_semana === diaSelecionado)
    .sort((a, b) => a.horario.localeCompare(b.horario));

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#FFD700" /></View>;
  }

  if (error) {
    return <View style={styles.centered}><Text style={{ color: 'red' }}>{error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* Botões dos dias da semana */}
      <View style={styles.diasContainer}>
        {diasDaSemana.map((dia) => (
          <TouchableOpacity
            key={dia.abrev}
            style={[styles.diaQuadro, diaSelecionado === dia.abrev && styles.diaSelecionado]}
            onPress={() => setDiaSelecionado(dia.abrev)}
          >
            <Text style={[styles.diaTexto, diaSelecionado === dia.abrev && styles.diaTextoSelecionado]}>
              {dia.abrev}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Lista de aulas clicáveis */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {aulasDoDia.length > 0 ? aulasDoDia.map(aula => (
          <TouchableOpacity key={aula.id} style={styles.horarioComAula} onPress={() => handleAulaPress(aula)}>
            <Text style={styles.horarioTexto}>{aula.horario}</Text>
            <Text style={styles.aulaTexto}>{aula.modalidade}</Text>
          </TouchableOpacity>
        )) : (
          <View style={styles.centered}>
            <Text style={styles.semAulasTexto}>Sem aulas agendadas para este dia.</Text>
          </View>
        )}
      </ScrollView>

      {/* Renderiza o Modal */}
      {aulaSelecionada && (
        <CheckInModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          aula={{...aulaSelecionada, dia_semana: diasDaSemana.find(d => d.abrev === aulaSelecionada.dia_semana)?.nome}}
          data={new Date().toLocaleDateString('pt-BR')}
          checkedInAlunos={checkedInAlunos}
          loading={loadingCheckIns}
          userHasCheckedIn={checkedInAlunos.some(aluno => aluno.aluno_id === user.id)}
          onCheckIn={handleCheckIn}
          onCancelCheckIn={handleCancelCheckIn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000", padding: 10 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
    diasContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 15,
    },
    diaQuadro: {
        backgroundColor: "#111",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginHorizontal: 2,
        alignItems: "center",
    },
    diaSelecionado: { backgroundColor: "#FFD700" },
    diaTexto: { color: "#fff", fontWeight: "bold" },
    diaTextoSelecionado: { color: "#000" },
    scrollContent: { paddingBottom: 20 },
    horarioComAula: {
        backgroundColor: "#222",
        borderLeftWidth: 5,
        borderLeftColor: "#FFD700",
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center'
    },
    horarioTexto: { color: "#aaa", fontSize: 16, fontWeight: 'bold' },
    aulaTexto: { color: "#FFD700", fontWeight: "bold", flex: 1, textAlign: 'right' },
    semAulasTexto: { color: '#888', fontSize: 16, fontStyle: 'italic' },
});
