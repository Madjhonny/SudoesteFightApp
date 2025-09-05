import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CheckInModal from '../componentes/CheckInModal';

// Garanta que este IP está correto para sua rede local
const API_URL = "http://192.168.100.5:3000";

const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

// Gera uma lista de horários para a grade
const gerarHorarios = () => {
  let horarios = [];
  for (let h = 6; h <= 21; h++) {
    horarios.push(`${h < 10 ? '0' + h : h}:00`);
    if (h !== 21) horarios.push(`${h < 10 ? '0' + h : h}:30`);
  }
  horarios.push("21:30");
  return horarios;
};

// Função para obter a data de hoje no formato YYYY-MM-DD
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AgendaScreen() {
  const { user } = useAuth();
  const [diaSelecionado, setDiaSelecionado] = useState("Seg");
  const [aulasDaSemana, setAulasDaSemana] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const horarios = gerarHorarios();

  // Estados para o Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [aulaSelecionada, setAulaSelecionada] = useState(null);
  const [checkedInAlunos, setCheckedInAlunos] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  // Função que verifica se a aula já passou, baseando-se no dia da semana também
  const checkIsClassFinished = (horario) => {
    const diaAbreviado = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    const hoje = new Date();
    const diaDaSemanaHoje = diaAbreviado[hoje.getDay()];

    // A regra só se aplica se o dia selecionado for o dia de hoje
    if (diaSelecionado !== diaDaSemanaHoje) {
      return false;
    }
    
    const [hours, minutes] = horario.split(':').map(Number);
    const classTime = new Date();
    classTime.setHours(hours, minutes, 0, 0);

    return hoje > classTime;
  };

  const fetchAgenda = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/agenda`);
      setAulasDaSemana(response.data);
    } catch (err) {
      console.error("Erro ao buscar a agenda:", err);
      setError("Não foi possível carregar a agenda. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  const handleAulaPress = async (aula) => {
    setAulaSelecionada(aula);
    setModalVisible(true);
    setLoadingModal(true);
    try {
      const today = getTodayDateString();
      const response = await axios.get(`${API_URL}/api/checkins/aula/${aula.id}/data/${today}`);
      setCheckedInAlunos(response.data);
    } catch (err) {
      console.error("Erro ao buscar check-ins:", err);
      Alert.alert("Erro", "Não foi possível carregar os check-ins desta aula.");
    } finally {
      setLoadingModal(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await axios.post(`${API_URL}/api/checkins`, {
        aluno_id: user.id,
        aula_id: aulaSelecionada.id,
        data_checkin: getTodayDateString(),
      });
      // Atualiza a lista de check-ins no modal
      handleAulaPress(aulaSelecionada);
    } catch (err) {
      console.error("Erro ao fazer check-in:", err);
      Alert.alert("Erro", "Não foi possível realizar o check-in.");
    }
  };

  const handleCancelCheckIn = async () => {
    try {
      await axios.delete(`${API_URL}/api/checkins`, {
        data: {
          aluno_id: user.id,
          aula_id: aulaSelecionada.id,
          data_checkin: getTodayDateString(),
        }
      });
      // Atualiza a lista de check-ins no modal
      handleAulaPress(aulaSelecionada);
    } catch (err) {
      console.error("Erro ao cancelar check-in:", err);
      Alert.alert("Erro", "Não foi possível cancelar o check-in.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{color: '#fff', marginTop: 10}}>A carregar agenda...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{color: 'red'}}>{error}</Text>
      </View>
    );
  }

  const aulasDoDia = aulasDaSemana.filter(a => a.dia_semana === diaSelecionado);

  return (
    <View style={styles.container}>
      {/* Dias da semana */}
      <View style={styles.diasContainer}>
        {dias.map((dia) => (
          <TouchableOpacity
            key={dia}
            style={[styles.diaQuadro, diaSelecionado === dia && styles.diaSelecionado]}
            onPress={() => setDiaSelecionado(dia)}
          >
            <Text style={[styles.diaTexto, diaSelecionado === dia && styles.diaTextoSelecionado]}>
              {dia}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Grade de horários */}
      <ScrollView contentContainerStyle={styles.horariosContainer}>
        {horarios.map((hora) => {
          const aulasDoHorario = aulasDoDia.filter(a => a.horario === hora);
          const temAula = aulasDoHorario.length > 0;
          return (
            <TouchableOpacity 
              key={hora}
              style={[styles.horarioItem, temAula && styles.horarioComAula]}
              onPress={() => temAula && handleAulaPress(aulasDoHorario[0])}
              disabled={!temAula}
            >
              <Text style={styles.horarioTexto}>{hora}</Text>
              {temAula && <Text style={styles.aulaTexto}>{aulasDoHorario.map(a => a.modalidade).join(' / ')}</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Modal */}
      {aulaSelecionada && (
        <CheckInModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          aula={aulaSelecionada}
          data={getTodayDateString()}
          checkedInAlunos={checkedInAlunos}
          loading={loadingModal}
          userHasCheckedIn={checkedInAlunos.some(aluno => aluno.aluno_id === user.id)}
          isClassFinished={checkIsClassFinished(aulaSelecionada.horario)}
          onCheckIn={handleCheckIn}
          onCancelCheckIn={handleCancelCheckIn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
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
  horariosContainer: { paddingBottom: 20 },
  horarioItem: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 50,
    alignItems: 'center'
  },
  horarioComAula: {
    backgroundColor: "#222",
    borderLeftWidth: 5,
    borderLeftColor: "#FFD700",
  },
  horarioTexto: { color: "#aaa", fontSize: 16 },
  aulaTexto: { color: "#FFD700", fontWeight: "bold", flex: 1, textAlign: 'right' },
});

