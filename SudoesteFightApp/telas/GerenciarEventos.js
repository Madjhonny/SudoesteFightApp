import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, TextInput, SafeAreaView, Alert } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = "http://192.168.100.5:3000"; // Confirme se o IP está correto

// --- Componente para o Modal de Adicionar/Editar ---
const AvisoModal = ({ visible, onClose, onSave, avisoInicial }) => {
    const [titulo, setTitulo] = useState('');
    const [mensagem, setMensagem] = useState('');

    useEffect(() => {
        // Preenche o formulário se estiver a editar um aviso existente
        if (avisoInicial) {
            setTitulo(avisoInicial.titulo || '');
            setMensagem(avisoInicial.mensagem || '');
        } else { // Limpa o formulário se estiver a criar um novo
            setTitulo('');
            setMensagem('');
        }
    }, [avisoInicial]);

    const handleSave = () => {
        if (!titulo.trim() || !mensagem.trim()) {
            Alert.alert("Campos obrigatórios", "Por favor, preencha o título e a mensagem.");
            return;
        }
        onSave({ ...avisoInicial, titulo, mensagem });
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{avisoInicial ? 'Editar Aviso' : 'Novo Aviso'}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Título do Aviso"
                        placeholderTextColor="#888"
                        value={titulo}
                        onChangeText={setTitulo}
                    />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Mensagem"
                        placeholderTextColor="#888"
                        value={mensagem}
                        onChangeText={setMensagem}
                        multiline
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
export default function GerenciarEventos() {
    const [avisos, setAvisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [avisoSelecionado, setAvisoSelecionado] = useState(null);
    const { user } = useAuth();

    const fetchAvisos = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/api/avisos`);
            setAvisos(response.data);
        } catch (error) {
            console.error("Erro ao buscar avisos:", error);
            Alert.alert("Erro", "Não foi possível carregar os avisos.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAvisos();
    }, [fetchAvisos]);

    const handleSaveAviso = async (aviso) => {
        const payload = {
            titulo: aviso.titulo,
            mensagem: aviso.mensagem,
            aluno_id: user.id, // Para o middleware de autorização do backend
        };

        try {
            if (aviso.id) { // Editando um aviso existente
                await axios.put(`${API_URL}/api/avisos/${aviso.id}`, payload);
            } else { // Criando um novo aviso
                await axios.post(`${API_URL}/api/avisos`, payload);
            }
            setModalVisible(false);
            setAvisoSelecionado(null);
            fetchAvisos(); // Recarrega a lista para mostrar as alterações
        } catch (error) {
            console.error("Erro ao salvar aviso:", error.response?.data || error.message);
            Alert.alert("Erro", "Não foi possível salvar o aviso.");
        }
    };

    const handleDeleteAviso = (id) => {
        Alert.alert(
            "Confirmar Exclusão",
            "Tem a certeza que deseja apagar este aviso?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Apagar", style: "destructive",
                    onPress: async () => {
                        try {
                            // O método delete no axios envia o corpo da requisição de forma diferente
                            await axios.delete(`${API_URL}/api/avisos/${id}`, {
                                data: { aluno_id: user.id } // Passa o ID no corpo para o middleware
                            });
                            fetchAvisos();
                        } catch (error) {
                            console.error("Erro ao apagar aviso:", error.response?.data || error.message);
                            Alert.alert("Erro", "Não foi possível apagar o aviso.");
                        }
                    }
                }
            ]
        );
    };

    const openModalParaEditar = (aviso) => {
        setAvisoSelecionado(aviso);
        setModalVisible(true);
    };

    const openModalParaCriar = () => {
        setAvisoSelecionado(null);
        setModalVisible(true);
    };

    const renderItem = ({ item }) => (
        <View style={styles.avisoContainer}>
            <View>
                <Text style={styles.avisoTitulo}>{item.titulo}</Text>
                <Text style={styles.avisoMensagem}>{item.mensagem}</Text>
            </View>
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={() => openModalParaEditar(item)}>
                    <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteAviso(item.id)}>
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
            <FlatList
                data={avisos}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum aviso publicado.</Text>}
                style={styles.list}
            />
            {/* Botão flutuante para adicionar novo aviso */}
            <TouchableOpacity style={styles.fab} onPress={openModalParaCriar}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
            <AvisoModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveAviso}
                avisoInicial={avisoSelecionado}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#000' },
    list: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    emptyText: { color: '#888', textAlign: 'center', marginTop: 50, fontSize: 16 },
    avisoContainer: {
        backgroundColor: '#1e1e1e',
        borderRadius: 8,
        padding: 15,
        marginHorizontal: 15,
        marginVertical: 8,
    },
    avisoTitulo: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
    avisoMensagem: { color: '#fff', fontSize: 16, marginTop: 5 },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 10,
    },
    actionButton: { marginLeft: 15 },
    actionText: { color: '#FFD700', fontSize: 16 },
    deleteText: { color: '#c1121f' },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
    },
    fabText: { fontSize: 30, color: '#000' },
    // Estilos do Modal
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
    modalContent: {
        backgroundColor: '#1e1e1e',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        alignItems: 'center',
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFD700', marginBottom: 20 },
    input: {
        backgroundColor: '#333',
        color: '#fff',
        borderRadius: 10,
        padding: 15,
        width: '100%',
        marginBottom: 15,
        fontSize: 16,
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    button: {
        borderRadius: 10,
        padding: 15,
        elevation: 2,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    buttonSave: { backgroundColor: '#FFD700' },
    buttonClose: { backgroundColor: '#555' },
    buttonText: { color: '#000', fontWeight: 'bold', textAlign: 'center' },
});

