import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CheckInModal from '../componentes/CheckInModal';
import AulaModal from '../componentes/AulaModal';

// Garanta que este IP está correto para a sua rede local
const API_URL = "http://172.16.10.208:3000";

const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const gerarHorarios = () => {
  let horarios = [];
  for (let h = 6; h <= 21; h++) {
    horarios.push(`${h < 10 ? '0' + h : h}:00`);
    if (h !== 21) horarios.push(`${h < 10 ? '0' + h : h}:30`);
  }
  horarios.push("21:30");
  return horarios;
};

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

  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [aulaParaCheckIn, setAulaParaCheckIn] = useState(null);
  const [checkedInAlunos, setCheckedInAlunos] = useState([]);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);

  const [aulaModalVisible, setAulaModalVisible] = useState(false);
  const [aulaParaGerir, setAulaParaGerir] = useState(null);
  const [horarioParaNovaAula, setHorarioParaNovaAula] = useState(null);

  const checkIsClassFinished = (horario) => {
    const diaAbreviado = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    const hoje = new Date();
    if (diaSelecionado !== diaAbreviado[hoje.getDay()]) {
      return false;
    }
    const [hours, minutes] = horario.split(':').map(Number);
    const classTime = new Date();
    classTime.setHours(hours, minutes, 0, 0);
    return hoje > classTime;
  };

  const fetchAgenda = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/agenda`);
      setAulasDaSemana(response.data);
    } catch (err) {
      setError("Não foi possível carregar a agenda.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAgenda(); }, [fetchAgenda]);

  const handleOpenCheckInModal = async (aula) => {
    setAulaParaCheckIn(aula);
    setCheckInModalVisible(true);
    setLoadingCheckIn(true);
    try {
      const today = getTodayDateString();
      const response = await axios.get(`${API_URL}/api/checkins/aula/${aula.id}/data/${today}`);
      setCheckedInAlunos(response.data);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível carregar os check-ins.");
    } finally {
      setLoadingCheckIn(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await axios.post(`${API_URL}/api/checkins`, {
        aluno_id: user.id,
        aula_id: aulaParaCheckIn.id,
        data_checkin: getTodayDateString(),
      });
      await handleOpenCheckInModal(aulaParaCheckIn);
    } catch (err) { Alert.alert("Erro", "Não foi possível realizar o check-in."); }
  };

  const handleCancelCheckIn = async () => {
    try {
      await axios.delete(`${API_URL}/api/checkins`, {
        data: {
          aluno_id: user.id,
          aula_id: aulaParaCheckIn.id,
          data_checkin: getTodayDateString(),
        }
      });
      await handleOpenCheckInModal(aulaParaCheckIn);
    } catch (err) { Alert.alert("Erro", "Não foi possível cancelar o check-in."); }
  };

  const handleOpenAulaModal = (aula, horario) => {
    setAulaParaGerir(aula);
    setHorarioParaNovaAula(horario);
    setAulaModalVisible(true);
  };

  const handleSaveAula = async (aula) => {
    const payload = {
      dia_semana: aula.dia_semana,
      horario: aula.horario,
      modalidade: aula.modalidade,
      aluno_id: user.id,
    };
    try {
      if (aula.id) { await axios.put(`${API_URL}/api/aulas/${aula.id}`, payload); }
      else { await axios.post(`${API_URL}/api/aulas`, payload); }
      setAulaModalVisible(false);
      fetchAgenda();
    } catch (error) { Alert.alert("Erro", "Não foi possível salvar a aula."); }
  };

  const handleDeleteAula = (aula) => {
    Alert.alert("Apagar Aula", `Tem a certeza que deseja apagar a aula de ${aula.modalidade} às ${aula.horario}?`, [
      { text: "Cancelar" },
      { text: "Apagar", style: "destructive", onPress: async () => {
          try {
            await axios.delete(`${API_URL}/api/aulas/${aula.id}?aluno_id=${user.id}`);
            fetchAgenda();
          } catch (error) { Alert.alert("Erro", "Não foi possível apagar a aula."); }
      }}
    ]);
  };

  const handleSlotPress = (aulasDoHorario, horario) => {
    if (user.role === 'professor') {
      if (aulasDoHorario.length > 0) {
        const aula = aulasDoHorario[0];
        Alert.alert(aula.modalidade, 'Escolha uma ação:', [
          { text: 'Ver Check-ins', onPress: () => handleOpenCheckInModal(aula) },
          { text: 'Editar Aula', onPress: () => handleOpenAulaModal(aula, null) },
          { text: 'Apagar Aula', onPress: () => handleDeleteAula(aula), style: 'destructive' },
          { text: 'Cancelar', style: 'cancel' },
        ]);
      } else {
        handleOpenAulaModal(null, horario);
      }
    } else {
      if (aulasDoHorario.length > 0) {
        handleOpenCheckInModal(aulasDoHorario[0]);
      }
    }
  };

  if (loading) { return <View style={styles.centered}><ActivityIndicator size="large" color="#FFD700" /></View>; }
  if (error) { return <View style={styles.centered}><Text style={{ color: 'red' }}>{error}</Text></View>; }

  const aulasDoDia = aulasDaSemana.filter(a => a.dia_semana === diaSelecionado);

  return (
    <View style={styles.container}>
      <View style={styles.diasContainer}>
        {dias.map((dia) => (
          <TouchableOpacity key={dia} style={[styles.diaQuadro, diaSelecionado === dia && styles.diaSelecionado]} onPress={() => setDiaSelecionado(dia)}>
            <Text style={[styles.diaTexto, diaSelecionado === dia && styles.diaTextoSelecionado]}>{dia}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.horariosContainer}>
        {horarios.map((hora) => {
          const aulasDoHorario = aulasDoDia.filter(a => a.horario === hora);
          const temAula = aulasDoHorario.length > 0;
          return (
            <TouchableOpacity key={hora} style={[styles.horarioItem, temAula && styles.horarioComAula]} onPress={() => handleSlotPress(aulasDoHorario, hora)}>
              <Text style={styles.horarioTexto}>{hora}</Text>
              {temAula && <Text style={styles.aulaTexto}>{aulasDoHorario.map(a => a.modalidade).join(' / ')}</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {aulaParaCheckIn && <CheckInModal visible={checkInModalVisible} onClose={() => setCheckInModalVisible(false)} aula={aulaParaCheckIn} data={getTodayDateString()} checkedInAlunos={checkedInAlunos} loading={loadingCheckIn} userHasCheckedIn={checkedInAlunos.some(aluno => aluno.aluno_id === user.id)} isClassFinished={checkIsClassFinished(aulaParaCheckIn.horario)} onCheckIn={handleCheckIn} onCancelCheckIn={handleCancelCheckIn} />}
      <AulaModal visible={aulaModalVisible} onClose={() => setAulaModalVisible(false)} onSave={handleSaveAula} aulaInicial={aulaParaGerir} horarioInicial={horarioParaNovaAula} diaInicial={diaSelecionado} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  diasContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 15 },
  diaQuadro: { backgroundColor: "#111", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginHorizontal: 2, alignItems: "center" },
  diaSelecionado: { backgroundColor: "#FFD700" },
  diaTexto: { color: "#fff", fontWeight: "bold" },
  diaTextoSelecionado: { color: "#000" },
  horariosContainer: { paddingBottom: 20 },
  horarioItem: { backgroundColor: "#111", padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", minHeight: 50, alignItems: 'center' },
  horarioComAula: { backgroundColor: "#222", borderLeftWidth: 5, borderLeftColor: "#FFD700" },
  horarioTexto: { color: "#aaa", fontSize: 16 },
  aulaTexto: { color: "#FFD700", fontWeight: "bold", flex: 1, textAlign: 'right' },
});

