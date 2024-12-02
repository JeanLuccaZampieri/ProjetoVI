import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const TermsOfUseModal = ({ visible, onAccept, onDecline }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onDecline}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Termos de Uso do Aplicativo</Text>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.modalText}>
              1. Aceitação dos Termos

              Ao utilizar este aplicativo, você concorda em cumprir e ficar vinculado aos seguintes termos e condições de uso. Se você não concordar com parte ou todos os termos, você não poderá usar o aplicativo.

              2. Uso do Aplicativo

              Você concorda em usar o aplicativo apenas para fins legais e de uma maneira que não infrinja os direitos de terceiros, nem restrinja ou iniba o uso e aproveitamento do aplicativo por qualquer terceiro.

              3. Contas de Usuário

              Para usar certas funcionalidades do aplicativo, você pode precisar criar uma conta. Você é responsável por manter a confidencialidade de sua conta e senha e por restringir o acesso ao seu dispositivo.

              4. Privacidade

              Nosso uso de suas informações pessoais é regido por nossa Política de Privacidade, que está incorporada a estes termos por referência.

              5. Propriedade Intelectual

              O conteúdo, organização, gráficos, design, compilação, tradução magnética, conversão digital e outros assuntos relacionados ao aplicativo são protegidos sob direitos autorais, marcas registradas e outros direitos proprietários.

              6. Limitação de Responsabilidade

              Em nenhum caso seremos responsáveis por quaisquer danos diretos, indiretos, incidentais, consequenciais, especiais ou exemplares, incluindo, mas não se limitando a, danos por perda de lucros, boa vontade, uso, dados ou outras perdas intangíveis.

              7. Modificações dos Termos

              Reservamo-nos o direito de modificar ou substituir estes termos a qualquer momento. É sua responsabilidade verificar os termos periodicamente para alterações.

              8. Lei Aplicável

              Estes termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar suas disposições sobre conflitos de leis.

              Ao usar este aplicativo, você concorda com estes termos. Se você não concorda com estes termos, por favor, não use o aplicativo.
            </Text>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={onDecline}
            >
              <Text style={styles.buttonText}>Recusar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={onAccept}
            >
              <Text style={styles.buttonText}>Aceitar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    maxHeight: '70%',
    width: '100%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'left',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: '45%',
  },
  acceptButton: {
    backgroundColor: '#2196F3',
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TermsOfUseModal;