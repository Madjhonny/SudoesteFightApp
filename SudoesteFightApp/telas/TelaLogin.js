// telas/TelaLogin.js
import React, { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // 1. Importa o hook do Contexto

// Lembre-se de manter este IP correto!
const API_URL = "http://192.168.100.7:3000"; 

export default function LoginScreen({ navigation }) {
  const [matricula, setMatricula] = useState("");
  const { login } = useAuth(); // 2. Pega a função 'login' do nosso AuthContext

  const handleLogin = async () => {
    if (matricula.trim() === "") {
      Alert.alert("Erro", "Por favor, digite sua matrícula.");
      return;
    }
    try {
      // Faz a requisição POST para a sua API de login
      const response = await axios.post(`${API_URL}/api/login`, {
        matricula: matricula,
      });

      // Se o login for bem-sucedido (status 200)
      if (response.data) {
        const userData = response.data; // Dados do aluno vindo do backend
        
        // 3. Salva os dados do usuário no estado global do aplicativo
        login(userData); 
        
        // 4. Navega para a tela principal (sem precisar passar parâmetros)
        navigation.replace("Main");
      }
    } catch (error) {
      // Se o servidor retornar um erro (ex: 401 Matrícula inválida)
      console.error("Erro no login:", error);
      Alert.alert("Falha no Login", "Matrícula inválida ou não encontrada. Tente novamente.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
      </View>
      <View style={styles.loginBox}>
        <Text style={styles.label}>Matrícula</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua matrícula"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          value={matricula}
          onChangeText={setMatricula}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
    marginBottom: 40,
  },
  logo: {
    width: 250,
    height: 120,
    resizeMode: "contain",
  },
  loginBox: {
    backgroundColor: "#111",
    borderRadius: 20,
    padding: 25,
    width: "80%",
    shadowColor: "#FFD700",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  label: {
    color: "#FFD700",
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 10,
    color: "#fff",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 16,
  },
});