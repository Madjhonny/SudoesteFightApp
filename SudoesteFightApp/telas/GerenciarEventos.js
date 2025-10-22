import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, TextInput, SafeAreaView, Alert, Image, ScrollView } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

const API_URL = "http://192.168.100.7:3000"; // Confirme se o seu IP está correto

// --- Componente para o Modal de Adicionar/Editar ---
const AvisoModal = ({ visible, onClose, onSave, avisoInicial }) => {
    const [titulo, setTitulo] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [media, setMedia] = useState(null); // Para guardar a mídia selecionada (URI local)

    useEffect(() => {
        if (avisoInicial) {
            setTitulo(avisoInicial.titulo || '');
            setMensagem(avisoInicial.mensagem || '');
            setMedia(avisoInicial.media_url ? { uri: avisoInicial.media_url } : null);
        } else {
            setTitulo('');
            setMensagem('');
            setMedia(null);
        }
    }, [avisoInicial]);

    const handleSelectMedia = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permissão necessária", "É preciso permitir o acesso à galeria.");
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All, // Permite imagens e vídeos
            allowsEditing: true,
            quality: 0.7,
        });

        if (pickerResult.canceled) {
            return;
        }
        setMedia(pickerResult.assets[0]);
    };

    const handleSave = () => {
        if (!titulo.trim() || !mensagem.trim()) {
            Alert.alert("Campos obrigatórios", "Por favor, preencha o título e a mensagem.");
            return;
        }
        onSave({ ...avisoInicial, titulo, mensagem, media });
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <SafeAreaView style={styles.modalContainer}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
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

                        {/* Preview da Mídia */}
                        {media && <Image source={{ uri: media.uri }} style={styles.mediaPreview} />}

                        <TouchableOpacity style={styles.mediaButton} onPress={handleSelectMedia}>
                            <Text style={styles.mediaButtonText}>{media ? 'Trocar Mídia' : 'Anexar Mídia'}</Text>
                        </TouchableOpacity>

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity style={[styles.button, styles.buttonSave]} onPress={handleSave}>
                                <Text style={styles.buttonText}>Salvar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={onClose}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
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
            Alert.alert("Erro", "Não foi possível carregar os avisos.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAvisos();
    }, [fetchAvisos]);

    const handleSaveAviso = async (aviso) => {
        const formData = new FormData();
        formData.append('titulo', aviso.titulo);
        formData.append('mensagem', aviso.mensagem);
        formData.append('aluno_id', user.id);

        // Anexa a nova mídia apenas se ela foi selecionada (se tem um 'uri' local)
        if (aviso.media && aviso.media.uri && !aviso.media.uri.startsWith('http')) {
            const filename = aviso.media.uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `media`;
            formData.append('media', { uri: aviso.media.uri, name: filename, type });
        }

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            if (aviso.id) { // Editando
                await axios.put(`${API_URL}/api/avisos/${aviso.id}`, formData, config);
            } else { // Criando
                await axios.post(`${API_URL}/api/avisos`, formData, config);
            }
            setModalVisible(false);
            fetchAvisos();
        } catch (error) {
            console.error("Erro ao salvar aviso:", error.response?.data || error);
            Alert.alert("Erro", "Não foi possível salvar o aviso.");
        }
    };
    
    const handleDeleteAviso = (id) => {
        Alert.alert("Confirmar Exclusão", "Tem a certeza que deseja apagar este aviso?", [
            { text: "Cancelar" },
            {
                text: "Apagar", style: "destructive",
                onPress: async () => {
                    try {
                        await axios.delete(`${API_URL}/api/avisos/${id}?aluno_id=${user.id}`);
                        fetchAvisos();
                    } catch (error) {
                        Alert.alert("Erro", "Não foi possível apagar o aviso.");
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.avisoContainer}>
            {item.media_url && <Image source={{ uri: item.media_url }} style={styles.avisoImage} />}
            <View style={styles.avisoContent}>
                <Text style={styles.avisoTitulo}>{item.titulo}</Text>
                <Text style={styles.avisoMensagem}>{item.mensagem}</Text>
            </View>
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={() => { setAvisoSelecionado(item); setModalVisible(true); }}>
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
            <TouchableOpacity style={styles.fab} onPress={() => { setAvisoSelecionado(null); setModalVisible(true); }}>
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
        marginHorizontal: 15,
        marginVertical: 10,
        overflow: 'hidden', // Para a imagem não sair das bordas
    },
    avisoImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#333',
    },
    avisoContent: {
        padding: 15,
    },
    avisoTitulo: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
    avisoMensagem: { color: '#fff', fontSize: 16, marginTop: 5 },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#333',
        padding: 10,
    },
    actionButton: { marginLeft: 20, padding: 5 },
    actionText: { color: '#FFD700', fontSize: 16 },
    deleteText: { color: '#c1121f' },
    fab: {
        position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30,
        backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center', elevation: 8,
    },
    fabText: { fontSize: 30, color: '#000' },
    // Estilos do Modal
    modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)' },
    modalContent: {
        backgroundColor: '#1e1e1e', borderRadius: 20, padding: 20, width: '90%',
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFD700', marginBottom: 20, textAlign: 'center' },
    input: {
        backgroundColor: '#333', color: '#fff', borderRadius: 10, padding: 15,
        width: '100%', marginBottom: 15, fontSize: 16,
    },
    textArea: { height: 120, textAlignVertical: 'top' },
    mediaPreview: {
        width: '100%',
        height: 180,
        borderRadius: 10,
        marginBottom: 15,
        backgroundColor: '#333',
    },
    mediaButton: {
        backgroundColor: '#555',
        borderRadius: 10,
        padding: 15,
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    mediaButtonText: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    button: {
        borderRadius: 10, padding: 15, elevation: 2, flex: 1, marginHorizontal: 5, alignItems: 'center',
    },
    buttonSave: { backgroundColor: '#FFD700' },
    buttonClose: { backgroundColor: '#555' },
    buttonText: { color: '#000', fontWeight: 'bold', textAlign: 'center' },
});

