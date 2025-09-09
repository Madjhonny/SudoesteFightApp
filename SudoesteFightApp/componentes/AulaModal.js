import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, SafeAreaView, Alert } from 'react-native';

export default function AulaModal({ visible, onClose, onSave, aulaInicial, horarioInicial, diaInicial }) {
    const [modalidade, setModalidade] = useState('');
    const [horario, setHorario] = useState('');
    const [dia, setDia] = useState('Seg');
    const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

    useEffect(() => {
        if (aulaInicial) { // Modo de Edição
            setModalidade(aulaInicial.modalidade || '');
            setHorario(aulaInicial.horario || '');
            setDia(aulaInicial.dia_semana || 'Seg');
        } else { // Modo de Criação
            setModalidade('');
            setHorario(horarioInicial || '');
            setDia(diaInicial || 'Seg');
        }
    }, [aulaInicial, horarioInicial, diaInicial]);

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
                    <View style={styles.diaSelector}>
                        {diasSemana.map(d => (
                            <TouchableOpacity key={d} style={[styles.diaBotao, dia === d && styles.diaSelecionado]} onPress={() => setDia(d)}>
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

const styles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
    modalContent: { backgroundColor: '#1e1e1e', borderRadius: 20, padding: 20, width: '90%', alignItems: 'center' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFD700', marginBottom: 20 },
    diaSelector: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 15 },
    diaBotao: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#555' },
    diaSelecionado: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
    diaTexto: { color: '#fff', fontWeight: 'bold' },
    diaTextoSelecionado: { color: '#000' },
    input: { backgroundColor: '#333', color: '#fff', borderRadius: 10, padding: 15, width: '100%', marginBottom: 15, fontSize: 16 },
    modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    button: { borderRadius: 10, padding: 15, elevation: 2, flex: 1, marginHorizontal: 5, alignItems: 'center' },
    buttonSave: { backgroundColor: '#FFD700' },
    buttonClose: { backgroundColor: '#555' },
    buttonText: { color: '#000', fontWeight: 'bold', textAlign: 'center' },
});

