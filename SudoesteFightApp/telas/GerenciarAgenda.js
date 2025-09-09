import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator, TouchableOpacity, Modal, TextInput, SafeAreaView, Alert } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = "http://192.168.100.7:3000"; // Confirme se o seu IP está correto

// --- Componente para o Modal de Adicionar/Editar Aula ---
const AulaModal = ({ visible, onClose, onSave, aulaInicial }) => {
    const [modalidade, setModalidade] = useState('');
    const [horario, setHorario] = useState('');
    const [dia, setDia] = useState('Seg');
    const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

    useEffect(() => {
        if (aulaInicial) {
            setModalidade(aulaInicial.modalidade || '');
            setHorario(aulaInicial.horario || '');
            setDia(aulaInicial.dia_semana || 'Seg');
        } else {
            setModalidade('');
            setHorario('');
            setDia('Seg');
        }
    }, [aulaInicial]);

    const handleSave = () => {
        if (!modalidade.trim() || !horario.trim() || !/^\d{2}:\d{2}$/.test(horario)) {
            Alert.alert("Dados inválidos", "Por favor, preencha a modalidade e o horário no formato HH:MM.");
            return;
        }
        onSave({ ...aulaInicial, modalidade, horario, dia_semana: dia });
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{aulaInicial ? 'Editar Aula' : 'Nova Aula'}</Text>
                    {/* Seletor de Dia */}
                    <View style={styles.diaSelector}>
                        {diasSemana.map(d => (
                            <TouchableOpacity
                                key={d}
                                style={[styles.diaBotao, dia === d && styles.diaSelecionado]}
                                onPress={() => setDia(d)}
                            >
                                <Text style={[styles.diaTexto, dia === d && styles.diaTextoSelecionado]}>{d}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Horário (ex: 19:00)"
                        placeholderTextColor="#888"
                        value={horario}
                        onChangeText={setHorario}
                        keyboardType="numeric"
                        maxLength={5}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Nome da Modalidade"
                        placeholderTextColor="#888"
                        value={modalidade}
                        onChangeText={setModalidade}
                    />
                    <View style={styles.modalButtonRow}>
                        <TouchableOpacity style={[styles.button, styles.buttonSave]} onPress={handleSave}>
                            <Text style={styles.buttonText}>Salvar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={onClose}>
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

// --- Componente Principal ---
export default function GerenciarAgenda() {
    const [aulas, setAulas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [aulaSelecionada, setAulaSelecionada] = useState(null);
    const { user } = useAuth();

    const fetchAulas = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/agenda`);
            const aulasOrdenadas = response.data.sort((a, b) => a.horario.localeCompare(b.horario));
            setAulas(formatarParaSectionList(aulasOrdenadas));
        } catch (error) {
            Alert.alert("Erro", "Não foi possível carregar a agenda.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAulas();
    }, [fetchAulas]);

    const formatarParaSectionList = (aulasArray) => {
        const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
        const grouped = dias.map(dia => ({
            title: dia,
            data: aulasArray.filter(aula => aula.dia_semana === dia)
        }));
        return grouped;
    };

    const handleSaveAula = async (aula) => {
        const payload = {
            dia_semana: aula.dia_semana,
            horario: aula.horario,
            modalidade: aula.modalidade,
            aluno_id: user.matricula, // Envia matrícula para backend
        };
        try {
            if (aula.id) { // Editando
                await axios.put(`${API_URL}/api/aulas/${aula.id}`, payload);
            } else { // Criando
                await axios.post(`${API_URL}/api/aulas`, payload);
            }
            setModalVisible(false);
            fetchAulas(); // Recarrega a lista
        } catch (error) {
            console.error("Erro ao salvar aula:", error.response?.data || error);
            Alert.alert("Erro", "Não foi possível salvar a aula.");
        }
    };

    const handleDeleteAula = (id) => {
        Alert.alert("Confirmar Exclusão", "Tem a certeza que deseja apagar esta aula? Os check-ins associados serão perdidos.", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Apagar", style: "destructive",
                onPress: async () => {
                    try {
                        await axios.delete(`${API_URL}/api/aulas/${id}?aluno_id=${user.matricula}`);
                        fetchAulas();
                    } catch (error) {
                        console.error("Erro ao apagar aula:", error.response?.data || error);
                        Alert.alert("Erro", "Não foi possível apagar a aula.");
                    }
                }
            }
        ]);
    };

    const openModalParaEditar = (aula) => {
        setAulaSelecionada(aula);
        setModalVisible(true);
    };

    const openModalParaCriar = () => {
        setAulaSelecionada(null);
        setModalVisible(true);
    };

    const renderItem = ({ item }) => (
        <View style={styles.aulaContainer}>
            <View>
                <Text style={styles.aulaHorario}>{item.horario}</Text>
                <Text style={styles.aulaModalidade}>{item.modalidade}</Text>
            </View>
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={() => openModalParaEditar(item)}>
                    <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteAula(item.id)}>
                    <Text style={[styles.actionText, styles.deleteText]}>Apagar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#FFD700" /></View>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <SectionList
                sections={aulas}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                renderSectionHeader={({ section: { title, data } }) => (
                    data.length > 0 ? <Text style={styles.sectionHeader}>{title}</Text> : null
                )}
                style={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma aula registada.</Text>}
            />
            <TouchableOpacity style={styles.fab} onPress={openModalParaCriar}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
            <AulaModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveAula}
                aulaInicial={aulaSelecionada}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#000' },
    list: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    emptyText: { color: '#888', textAlign: 'center', marginTop: 50, fontSize: 16 },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700',
        backgroundColor: '#111',
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginTop: 10,
    },
    aulaContainer: {
        backgroundColor: '#1e1e1e',
        padding: 15,
        marginHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    aulaHorario: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    aulaModalidade: { color: '#ccc', fontSize: 16, marginTop: 2 },
    actionsContainer: { flexDirection: 'row' },
    actionButton: { marginLeft: 15 },
    actionText: { color: '#FFD700', fontSize: 16 },
    deleteText: { color: '#c1121f' },
    fab: {
        position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30,
        backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center', elevation: 8,
    },
    fabText: { fontSize: 30, color: '#000' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
    modalContent: {
        backgroundColor: '#1e1e1e', borderRadius: 20, padding: 20, width: '90%', alignItems: 'center',
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFD700', marginBottom: 20 },
    diaSelector: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 15 },
    diaBotao: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#555' },
    diaSelecionado: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
    diaTexto: { color: '#fff', fontWeight: 'bold' },
    diaTextoSelecionado: { color: '#000' },
    input: {
        backgroundColor: '#333', color: '#fff', borderRadius: 10, padding: 15,
        width: '100%', marginBottom: 15, fontSize: 16,
    },
    modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    button: {
        borderRadius: 10, padding: 15, elevation: 2, flex: 1, marginHorizontal: 5, alignItems: 'center',
    },
    buttonSave: { backgroundColor: '#FFD700' },
    buttonClose: { backgroundColor: '#555' },
    buttonText: { color: '#000', fontWeight: 'bold', textAlign: 'center' },
});