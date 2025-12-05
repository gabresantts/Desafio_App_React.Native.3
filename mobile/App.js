import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator
} from 'react-native';

const API_URL = 'http://10.0.0.234:3000';

const App = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState('estudante');
  const [editandoId, setEditandoId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [detalhesUsuario, setDetalhesUsuario] = useState(null);

  const buscarUsuarios = async () => {
    setCarregando(true);
    try {
      const response = await fetch(`${API_URL}/usuarios`);
      const data = await response.json();
      if (data.success) {
        setUsuarios(data.data);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor');
    } finally {
      setCarregando(false);
    }
  };

  const buscarDetalhesUsuario = async (id) => {
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`);
      const data = await response.json();
      if (data.success) {
        setDetalhesUsuario(data.data);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao buscar detalhes');
    }
  };

  const salvarUsuario = async () => {
    if (!nome.trim() || !email.trim()) {
      Alert.alert('Atenção', 'Preencha nome e email');
      return;
    }

    const usuarioData = { nome, email, tipo };

    try {
      if (editandoId) {
        const response = await fetch(`${API_URL}/usuarios/${editandoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(usuarioData)
        });
        
        const data = await response.json();
        if (data.success) {
          Alert.alert('Sucesso', 'Usuário atualizado');
        }
      } else {
        const response = await fetch(`${API_URL}/usuarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(usuarioData)
        });
        
        const data = await response.json();
        if (data.success) {
          Alert.alert('Sucesso', 'Usuário criado');
        }
      }
      
      limparFormulario();
      buscarUsuarios();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar usuário');
    }
  };

  const deletarUsuario = (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/usuarios/${id}`, {
                method: 'DELETE'
              });
              
              const data = await response.json();
              if (data.success) {
                Alert.alert('Sucesso', 'Usuário excluído');
                buscarUsuarios();
              }
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir');
            }
          }
        }
      ]
    );
  };

  const limparFormulario = () => {
    setNome('');
    setEmail('');
    setTipo('estudante');
    setEditandoId(null);
    setDetalhesUsuario(null);
  };

  const abrirFormularioEdicao = (usuario) => {
    setNome(usuario.nome);
    setEmail(usuario.email);
    setTipo(usuario.tipo);
    setEditandoId(usuario.id);
    setModalVisible(true);
  };

  const abrirFormularioNovo = () => {
    limparFormulario();
    setModalVisible(true);
  };

  useEffect(() => {
    buscarUsuarios();
  }, []);

  const getCorTipo = (tipo) => {
    switch (tipo) {
      case 'estudante': return '#4CAF50';
      case 'professor': return '#2196F3';
      case 'administrador': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CRUD Usuários</Text>
        <Text style={styles.subtitle}>Expo SDK 54</Text>
      </View>

      <TouchableOpacity style={styles.botaoAdicionar} onPress={abrirFormularioNovo}>
        <Text style={styles.botaoAdicionarTexto}>Adicionar Usuário</Text>
      </TouchableOpacity>

      {carregando ? (
        <View style={styles.carregandoContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.carregandoTexto}>Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardNome}>{item.nome}</Text>
                <Text style={styles.cardEmail}>{item.email}</Text>
                <View style={[styles.cardBadge, { backgroundColor: getCorTipo(item.tipo) }]}>
                  <Text style={styles.cardBadgeText}>{item.tipo}</Text>
                </View>
              </View>
              <View style={styles.cardBotoes}>
                <TouchableOpacity
                  style={[styles.botaoCard, styles.botaoDetalhes]}
                  onPress={() => buscarDetalhesUsuario(item.id)}
                >
                  <Text style={styles.botaoCardTexto}>Ver</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.botaoCard, styles.botaoEditar]}
                  onPress={() => abrirFormularioEdicao(item)}
                >
                  <Text style={styles.botaoCardTexto}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.botaoCard, styles.botaoExcluir]}
                  onPress={() => deletarUsuario(item.id)}
                >
                  <Text style={styles.botaoCardTexto}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.listaVazia}>
              <Text style={styles.listaVaziaTexto}>Nenhum usuário</Text>
            </View>
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editandoId ? 'Editar Usuário' : 'Novo Usuário'}
            </Text>
            
            <ScrollView>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Tipo</Text>
              <View style={styles.radioGroup}>
                {['estudante', 'professor', 'administrador'].map((opcao) => (
                  <TouchableOpacity
                    key={opcao}
                    style={[
                      styles.radioButton,
                      tipo === opcao && styles.radioButtonSelecionado
                    ]}
                    onPress={() => setTipo(opcao)}
                  >
                    <Text style={[
                      styles.radioTexto,
                      tipo === opcao && styles.radioTextoSelecionado
                    ]}>{opcao}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalBotoes}>
                <TouchableOpacity
                  style={[styles.botaoModal, styles.botaoCancelar]}
                  onPress={() => {
                    setModalVisible(false);
                    limparFormulario();
                  }}
                >
                  <Text style={styles.botaoModalTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.botaoModal, styles.botaoSalvar]}
                  onPress={salvarUsuario}
                >
                  <Text style={styles.botaoModalTexto}>
                    {editandoId ? 'Atualizar' : 'Salvar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={!!detalhesUsuario}
        onRequestClose={() => setDetalhesUsuario(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Detalhes</Text>
            
            {detalhesUsuario && (
              <View style={styles.detalhesContainer}>
                <View style={styles.detalhesItem}>
                  <Text style={styles.detalhesLabel}>ID:</Text>
                  <Text style={styles.detalhesValor}>{detalhesUsuario.id}</Text>
                </View>
                <View style={styles.detalhesItem}>
                  <Text style={styles.detalhesLabel}>Nome:</Text>
                  <Text style={styles.detalhesValor}>{detalhesUsuario.nome}</Text>
                </View>
                <View style={styles.detalhesItem}>
                  <Text style={styles.detalhesLabel}>Email:</Text>
                  <Text style={styles.detalhesValor}>{detalhesUsuario.email}</Text>
                </View>
                <View style={styles.detalhesItem}>
                  <Text style={styles.detalhesLabel}>Tipo:</Text>
                  <View style={[
                    styles.badgeTipo,
                    { backgroundColor: getCorTipo(detalhesUsuario.tipo) }
                  ]}>
                    <Text style={styles.badgeTipoTexto}>{detalhesUsuario.tipo}</Text>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.botaoModal, styles.botaoFechar]}
              onPress={() => setDetalhesUsuario(null)}
            >
              <Text style={styles.botaoModalTexto}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Total: {usuarios.length}
        </Text>
        <TouchableOpacity onPress={buscarUsuarios}>
          <Text style={styles.botaoAtualizar}>Atualizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  botaoAdicionar: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  botaoAdicionarTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  carregandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carregandoTexto: {
    marginTop: 10,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardContent: {
    marginBottom: 10,
  },
  cardNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cardBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 5,
  },
  cardBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  cardBotoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  botaoCard: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  botaoCardTexto: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  botaoDetalhes: {
    backgroundColor: '#2196F3',
  },
  botaoEditar: {
    backgroundColor: '#FF9800',
  },
  botaoExcluir: {
    backgroundColor: '#F44336',
  },
  listaVazia: {
    alignItems: 'center',
    padding: 40,
  },
  listaVaziaTexto: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  radioButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  radioButtonSelecionado: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  radioTexto: {
    fontSize: 14,
    color: '#666',
  },
  radioTextoSelecionado: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  botaoModal: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  botaoModalTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoCancelar: {
    backgroundColor: '#9E9E9E',
  },
  botaoSalvar: {
    backgroundColor: '#4CAF50',
  },
  botaoFechar: {
    backgroundColor: '#2196F3',
    marginTop: 20,
  },
  detalhesContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  detalhesItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detalhesLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    width: 60,
  },
  detalhesValor: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  badgeTipo: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTipoTexto: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  botaoAtualizar: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
});

export default App;