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
  isClassFinished, // <--  propriedade para saber se a aula já passou
  onCheckIn,
  onCancelCheckIn
}) {
  if (!aula) {
    return null;
  }

  // Lógica para determinar se o botão de cancelar deve estar ativo
  const canCancel = userHasCheckedIn && !isClassFinished;

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
            <ActivityIndicator size="small" color="#FFD700" style={{ marginVertical: 20 }} />
          ) : (
            <FlatList
              data={checkedInAlunos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <Text style={styles.alunoItem}>- {item.nome}</Text>}
              ListEmptyComponent={<Text style={styles.alunoItem}>Ninguém fez check-in ainda.</Text>}
              style={styles.alunoList}
            />
          )}

          {/* Botão principal com a nova lógica */}
          <TouchableOpacity
            style={[
              styles.button,
              userHasCheckedIn
                ? (isClassFinished ? styles.buttonConfirmed : styles.buttonCancel)
                : styles.buttonCheckIn
            ]}
            onPress={userHasCheckedIn ? (canCancel ? onCancelCheckIn : null) : onCheckIn}
            disabled={userHasCheckedIn && isClassFinished} // Desabilita o botão se o check-in estiver feito e a aula já passou
          >
            <Text style={styles.textStyle}>
              {userHasCheckedIn
                ? (isClassFinished ? 'Check-in Realizado' : 'Cancelar Check-in')
                : 'Fazer Check-in'}
            </Text>
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
    width: '90%',
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
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
  alunoList: {
    width: '100%',
    maxHeight: 150,
    marginBottom: 20,
  },
  alunoItem: {
    fontSize: 16,
    color: '#ddd',
    paddingVertical: 4,
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    width: '100%',
    marginTop: 10,
  },
  buttonCheckIn: {
    backgroundColor: '#4CAF50', // Verde para fazer check-in
  },
  buttonCancel: {
    backgroundColor: '#c1121f', // Vermelho para cancelar
  },
  buttonConfirmed: {
    backgroundColor: '#2a9d8f', // Um verde diferente para "realizado"
    opacity: 0.7,
  },
  buttonClose: {
    backgroundColor: '#6c757d',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

