/************************************** PACOTES DO REACT NATIVE **************************************/
import React, { useState } from 'react';
import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
  View,
  Text,
  Keyboard,
  TextInput,
  Modal,
  Alert,
  ScrollView
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { AntDesign } from '@expo/vector-icons';

/********************************************** CLASSES **********************************************/
// Classe para interface de anotação de serviços
class InterfaceAnotacaoServico {
  // Construtor da classe
  constructor(nomeCliente, tipoServico, telefoneCliente, carro, descricao, data, detalhes) {
    this.nomeCliente = nomeCliente;
    this.tipoServico = tipoServico;
    this.telefoneCliente = telefoneCliente;
    this.carro = carro;
    this.descricao = descricao;
    this.data = data;
    this.detalhes = detalhes;
  }  
  
  // Método para exibir os campos a serem preenchidos
  exibirFormulario(setModalVisible) {
    setModalVisible(true);
  }

  // Método para capturar os dados dos campos
  static capturarEntrada(formData) {
    return new InterfaceAnotacaoServico(
      formData.nomeCliente,
      formData.tipoServico,
      formData.telefoneCliente,
      formData.carro,
      formData.descricao,
      formData.data,
      formData.detalhes
    );
  }

  // Método para editar uma anotação
  editarEntrada(novosDados) {
    Object.assign(this, novosDados);
  }
}

/*****************************************************************************************************/
// Classe de controle de regsitros
class ControleRegistroServico {
  // Método para validação de dados
  static validarDados(formData) {
    if (!formData.nomeCliente || !formData.tipoServico || !formData.carro || !formData.data) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return null;
    }
    return InterfaceAnotacaoServico.capturarEntrada(formData);
  }  
}

/*****************************************************************************************************/
// Classe para a criação de serviços
class Servico {
  // Método que criará o serviço de acordo com os dados preenchidos
  criarServico(formData) {
    const servicoValidado = ControleRegistroServico.validarDados(formData);
    if (!servicoValidado) return null;
    return servicoValidado;
  }
}
/*********************************************** BACK-END **********************************************/
const { width } = Dimensions.get('window');

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje',
};
LocaleConfig.defaultLocale = 'pt-br';

export default function App() {
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisibleAdd, setModalVisibleAdd] = useState(false);
  const [modalVisibleEdit, setModalVisibleEdit] = useState(false);
  const [formData, setFormData] = useState({
    nomeCliente: '',
    tipoServico: '',
    telefoneCliente: '',
    carro: '',
    descricao: '',
    data: '',
    detalhes: '',
  });

  const [servicos, setServicos] = useState([]);

  const [detalhesServicoVisible, setDetalhesServicoVisible] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState(null); // Para armazenar o serviço selecionado
  
  const [servicoEditando, setServicoEditando] = useState(null);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const salvarServico = () => {
    const novoServico = new Servico().criarServico({ ...formData, data: selectedDate });
  
    if (!novoServico) return; // Não adiciona serviço inválido
  
    if (servicoEditando) {
      // Atualizando o serviço existente
      const novosServicos = servicos.map(servico =>
        servico === servicoEditando ? novoServico : servico
      );
      setServicos(novosServicos);
    } else {
      // Adicionando novo serviço
      setServicos([...servicos, novoServico]);
    }
  
    // Limpa os campos preenchidos
    setFormData({
      nomeCliente: '',
      tipoServico: '',
      telefoneCliente: '',
      carro: '',
      descricao: '',
      data: '',
      detalhes: '',
    });
  
    setServicoEditando(null); // Limpa o serviço em edição
    setModalVisibleEdit(false); // Fecha o modal de edição de serviços
    setModalVisibleAdd(false); // Fecha o modal de adição de serviços
  };

  const removerServico = (servicoParaRemover) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este serviço?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            setServicos(servicos.filter(servico => 
              servico.nomeCliente !== servicoParaRemover.nomeCliente ||
              servico.tipoServico !== servicoParaRemover.tipoServico ||
              servico.carro !== servicoParaRemover.carro ||
              servico.data !== servicoParaRemover.data
            ));
          },
        },
      ],
      { cancelable: true }
    );
  };

  const exibirDetalhesServico = (servico) => {
    setServicoSelecionado(servico);
    setDetalhesServicoVisible(true);
  };

  /********************************************** FRONT-END **********************************************/
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>AgendaFIO</Text>
          </View>

          {/* Calendário */}
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#1d2743' }
            }}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              selectedDayBackgroundColor: '#3498db',
              todayTextColor: '#e74c3c',
              arrowColor: '#1d2743',
              monthTextColor: 'rgb(0, 0, 0)',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: 'bold',
            }}
          />
          {selectedDate && (
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedDate}>Serviços do dia:</Text>
              <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={true}>
              {servicos
                .filter(servico => servico.data === selectedDate)
                .map((servico, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.servicoCard}
                    onPress={() => exibirDetalhesServico(servico)}
                    activeOpacity={0.7}>
                    <Text style={styles.servicoTitle}>Cliente: {servico.nomeCliente}</Text>
                    <Text>Tipo de serviço: {servico.tipoServico}</Text>
                    <Text>Veículo: {servico.carro}</Text>
                    <Text>Descrição: {servico.descricao}</Text>

                    {/* Ícone de lápis azul para edição */}
                    <TouchableOpacity
                      onPress={() => {
                        setServicoEditando(servico);  // Atribuindo o serviço selecionado
                        setFormData({
                          nomeCliente: servico.nomeCliente,
                          tipoServico: servico.tipoServico,
                          telefoneCliente: servico.telefoneCliente,
                          carro: servico.carro,
                          descricao: servico.descricao,
                          data: servico.data,
                          detalhes: servico.detalhes,
                        }); // Preenchendo os campos do formulário
                        setModalVisibleEdit(true); // Abrindo o modal de edição
                      }}
                      style={styles.editButton}>
                      <AntDesign name="edit" size={24} color="blue" />
                    </TouchableOpacity>

                    {/* Ícone de lixeira vermelha para exclusão */}
                    <TouchableOpacity
                      onPress={() => removerServico(servico)}
                      style={styles.deleteButton}>
                      <AntDesign name="delete" size={24} color="red" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Detalhes do Serviço */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={detalhesServicoVisible}
            onRequestClose={() => setDetalhesServicoVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Detalhes do Serviço</Text>

                {servicoSelecionado && (
                  <>
                    <Text><Text style={styles.boldText}>Cliente: </Text>{servicoSelecionado.nomeCliente}</Text>
                    <Text><Text style={styles.boldText}>Tipo de Serviço: </Text>{servicoSelecionado.tipoServico}</Text>
                    <Text><Text style={styles.boldText}>Telefone: </Text>{servicoSelecionado.telefoneCliente}</Text>
                    <Text><Text style={styles.boldText}>Veículo: </Text>{servicoSelecionado.carro}</Text>
                    <Text><Text style={styles.boldText}>Descrição: </Text>{servicoSelecionado.descricao}</Text>
                    <Text><Text style={styles.boldText}>Detalhes: </Text>{servicoSelecionado.detalhes}</Text>
                    <Text><Text style={styles.boldText}>Data: </Text>{servicoSelecionado.data}</Text>
                  </>
                )}

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setDetalhesServicoVisible(false)}>
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Modal de Edição de Serviço */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisibleEdit}
            onRequestClose={() => {
              setModalVisibleEdit(false);
              setServicoEditando(null);  // Limpar serviço ao fechar
            }}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Editar Serviço</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Nome do Cliente (Obrigatório)"
                  value={formData.nomeCliente}
                  onChangeText={(text) => handleInputChange('nomeCliente', text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Tipo de Serviço (Obrigatório)"
                  value={formData.tipoServico}
                  onChangeText={(text) => handleInputChange('tipoServico', text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Telefone Cliente"
                  value={formData.telefoneCliente}
                  keyboardType="phone-pad"
                  onChangeText={(text) => handleInputChange('telefoneCliente', text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Carro (Obrigatório)"
                  value={formData.carro}
                  onChangeText={(text) => handleInputChange('carro', text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Descrição"
                  value={formData.descricao}
                  multiline
                  onChangeText={(text) => handleInputChange('descricao', text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Data (Obrigatório)"
                  value={formData.data}
                  onChangeText={(text) => handleInputChange('data', text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Detalhes"
                  value={formData.detalhes}
                  multiline
                  onChangeText={(text) => handleInputChange('detalhes', text)}
                />

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={salvarServico}>
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setModalVisibleEdit(false);
                    setServicoEditando(null);  // Limpar serviço ao fechar
                  }}>
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Botão Flutuante '+' */}
          <TouchableOpacity style={styles.floatingButton} onPress={() => {
            setServicoEditando(null);
            setModalVisibleAdd(true);
            }}>
            <AntDesign name="plus" size={24} color="white" />
          </TouchableOpacity>

          {/* Modal para adicionar serviço */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisibleAdd}
            onRequestClose={() => setModalVisibleAdd(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Adicionar Serviço</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Nome do Cliente (Obrigatório)"
                  onChangeText={(text) => handleInputChange('nomeCliente', text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Tipo de Serviço (Obrigatório)"
                  onChangeText={(text) => handleInputChange('tipoServico', text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Telefone Cliente"
                  keyboardType="phone-pad"
                  onChangeText={(text) => handleInputChange('telefoneCliente', text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Carro (Obrigatório)"
                  onChangeText={(text) => handleInputChange('carro', text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Descrição"
                  multiline
                  onChangeText={(text) => handleInputChange('descricao', text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Data (Obrigatório)"
                  onChangeText={(text) => handleInputChange('data', text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Detalhes"
                  multiline
                  onChangeText={(text) => handleInputChange('detalhes', text)}
                />

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={salvarServico}>
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisibleAdd(false)}>
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 36,
    backgroundColor: 'rgb(255, 255, 255)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1d2743',
    marginBottom: 12,
    marginTop: 12,
  },
  selectedDate: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginTop: 14,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    backgroundColor: '#1d2743',
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#1d2743',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButtonText: {
    color: 'red',
    fontSize: 16,
    marginTop: 12,
  },
  servicoCard: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  servicoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1d2743',
  },
  deleteButton: {
    position: 'relative',
    left: 335,
    padding: 5,
  },
  editButton: {
    position: 'absolute',
    right: 60,
    top: 90,
    padding: 5,
  },
  boldText: {
    fontWeight: 'bold',
  },
});
