import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API_URL = "http://192.168.100.7:3000";

export default function BarraLateral() {
  const navigation = useNavigation();
  const { user, logout, login } = useAuth();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permissão necessária", "Você precisa permitir o acesso à galeria para trocar a foto.");
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (pickerResult.canceled === true) return;

    const imageUri = pickerResult.assets[0].uri;
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('foto', { uri: imageUri, name: filename, type });

    try {
      const response = await axios.post(`${API_URL}/api/alunos/${user.matricula}/foto`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      login(response.data);
      Alert.alert("Sucesso", "Foto de perfil atualizada!");
    } catch (error) {
      console.error("Erro no upload da imagem:", error);
      Alert.alert("Erro", "Não foi possível atualizar a foto.");
    }
  };

  const handleLogout = () => {
    logout();
    navigation.navigate('Login');
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{ uri: user.foto_url || "https://i.pravatar.cc/150" }}
            style={styles.foto}
          />
        </TouchableOpacity>
        <Text style={styles.nome}>{user.nome}</Text>
        <Text style={styles.modalidade}>{user.modalidade}</Text>
      </View>

      {user.role === 'professor' && (
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PainelProfessor')}>
          <Text style={styles.menuItemText}>Painel do Professor</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.botaoSair} onPress={handleLogout}>
        <Text style={styles.textoBotaoSair}>Sair</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 20,
    justifyContent: 'space-between',
  },
  foto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFD700',
    alignSelf: 'center',
    marginBottom: 20,
  },
  nome: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalidade: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  botaoSair: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
  },
  textoBotaoSair: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  menuItem: {
    backgroundColor: '#1e1e1e',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  menuItemText: {
    color: '#FFD700',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
});