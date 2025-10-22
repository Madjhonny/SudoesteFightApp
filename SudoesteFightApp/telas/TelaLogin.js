import React, { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Alert, Platform } from "react-native";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://192.168.100.7:3000"; // Confirme se o IP está correto

export default function LoginScreen({ navigation }) {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState(""); // 1. Novo estado para a senha
  const { login } = useAuth();

  const handleLogin = async () => {
    if (matricula.trim() === "" || senha.trim() === "") {
      Alert.alert("Erro", "Por favor, preencha a matrícula e a senha.");
      return;
    }
    try {
      // 2. Envia a matrícula E a senha para o backend
      const response = await axios.post(`${API_URL}/api/login`, {
        matricula: matricula,
        senha: senha,
      });

      if (response.data) {
        login(response.data);
        navigation.replace("Main");
      }
    } catch (error) {
      console.error("Erro no login:", error.response?.data || error.message);
      Alert.alert("Falha no Login", "Matrícula ou senha inválida. Tente novamente.");
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
          placeholder="Digite a sua matrícula"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          value={matricula}
          onChangeText={setMatricula}
        />
        
        {/* 3. Novo campo de texto para a senha */}
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite a sua senha"
          placeholderTextColor="#aaa"
          secureTextEntry={true} // Esconde os caracteres da senha
          value={senha}
          onChangeText={setSenha}
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
    width: Platform.select({
      web: 350,
      default: '80%',
    }),
    maxWidth: '90%',
    elevation: 10,
  },
  label: {
    color: "#FFD700",
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10, // Adiciona um espaço acima do rótulo da senha
  },
  input: {
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 12, // Um pouco mais de padding
    color: "#fff",
    marginBottom: 15, // Um pouco menos de margem
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 16,
  },
});

