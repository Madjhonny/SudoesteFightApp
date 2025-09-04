import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';

export default function CheckInModal({
  visible,
  onClose,
  aula,
  data,
  checkedInAlunos,
  loading,
  userHasCheckedIn,
  onCheckIn,
  onCancelCheckIn
}) {
  // Se não houver uma aula selecionada, não renderiza nada
  if (!aula) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{aula.modalidade}</Text>
          <Text style={styles.modalSubtitle}>{aula.dia_semana} às {aula.horario} - {data}</Text>

          <Text style={styles.listHeader}>Check-ins Confirmados ({checkedInAlunos.length})</Text>
          
          {loading ? (
            <ActivityIndicator color="#FFD700" style={{ marginVertical: 20 }} />
          ) : (
            <FlatList
              style={styles.list}
              data={checkedInAlunos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <Text style={styles.alunoNome}>- {item.nome}</Text>}
              ListEmptyComponent={<Text style={styles.emptyListText}>Ninguém fez check-in ainda.</Text>}
            />
          )}

          <TouchableOpacity
            style={[styles.button, userHasCheckedIn ? styles.buttonCancel : styles.buttonCheckIn]}
            onPress={userHasCheckedIn ? onCancelCheckIn : onCheckIn}
          >
            <Text style={styles.textStyle}>{userHasCheckedIn ? 'Cancelar Check-in' : 'Fazer Check-in'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={onClose}
          >
            <Text style={styles.textStyle}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 20,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  list: {
    width: '100%',
    maxHeight: 150,
    marginBottom: 20,
  },
  alunoNome: {
    color: '#ddd',
    fontSize: 16,
    paddingVertical: 4,
  },
  emptyListText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    width: '100%',
    marginBottom: 10,
  },
  buttonCheckIn: {
    backgroundColor: '#FFD700',
  },
  buttonCancel: {
    backgroundColor: '#c1121f', // Vermelho para cancelar
  },
  buttonClose: {
    backgroundColor: '#444',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
