import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = "http://192.168.100.7:3000"; // Confirme se o IP está correto

export default function CadastrarAlunoScreen({ navigation }) {
    const { user } = useAuth(); // Pega os dados do professor logado
    const [nome, setNome] = useState('');
    const [matricula, setMatricula] = useState('');
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCadastro = async () => {
        if (!nome.trim() || !matricula.trim() || !senha.trim()) {
            Alert.alert("Campos obrigatórios", "Por favor, preencha nome, matrícula e senha.");
            return;
        }

        setLoading(true);

        const payload = {
            nome,
            matricula,
            cpf,
            senha,
            aluno_id: user.id, // Envia o ID do professor para autorização do backend
        };

        try {
            const response = await axios.post(`${API_URL}/api/alunos`, payload);
            Alert.alert("Sucesso!", `Aluno "${response.data.nome}" cadastrado com sucesso.`);
            // Limpa os campos após o sucesso
            setNome('');
            setMatricula('');
            setCpf('');
            setSenha('');
            navigation.goBack(); // Opcional: volta para o painel do professor
        } catch (error) {
            console.error("Erro ao cadastrar aluno:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.error || "Não foi possível cadastrar o aluno.";
            Alert.alert("Erro no Cadastro", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Cadastrar Novo Aluno</Text>
                
                <Text style={styles.label}>Nome Completo</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nome do aluno"
                    placeholderTextColor="#888"
                    value={nome}
                    onChangeText={setNome}
                />

                <Text style={styles.label}>Matrícula</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Matrícula do aluno"
                    placeholderTextColor="#888"
                    value={matricula}
                    onChangeText={setMatricula}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>CPF (Opcional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="CPF do aluno"
                    placeholderTextColor="#888"
                    value={cpf}
                    onChangeText={setCpf}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Senha Provisória</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Senha de acesso inicial"
                    placeholderTextColor="#888"
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry
                />

                <TouchableOpacity 
                    style={[styles.button, loading && styles.buttonDisabled]} 
                    onPress={handleCadastro}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Cadastrando...' : 'Cadastrar Aluno'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flexGrow: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 30,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        color: '#ccc',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1e1e1e',
        color: '#fff',
        borderRadius: 10,
        padding: 15,
        width: '100%',
        marginBottom: 20,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    button: {
        backgroundColor: '#FFD700',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#555',
    },
    buttonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
