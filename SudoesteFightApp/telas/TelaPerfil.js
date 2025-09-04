// telas/TelaPerfil.js
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function PerfilScreen({ route }) { // 👈 Recebe 'route'
  const { user } = route.params; // 👈 Pega os dados do usuário

  // Se não houver dados de usuário, mostra uma mensagem de carregamento ou erro
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.nome}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://i.pravatar.cc/150" }} // Imagem placeholder
        style={styles.foto}
      />
      {/* 👇 Exibe os dados dinâmicos do usuário */}
      <Text style={styles.nome}>{user.nome}</Text>
      <Text style={styles.info}>Modalidade: {user.modalidade}</Text>
      <Text style={styles.info}>Tempo de treino: {user.tempo_treino}</Text>
      <Text style={styles.info}>Graduação: {user.graduacao}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  foto: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, borderWidth: 3, borderColor: "#FFD700" },
  nome: { color: "#FFD700", fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  info: { color: "#fff", fontSize: 16, marginBottom: 6 },
});
