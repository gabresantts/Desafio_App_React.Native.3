const express = require('express');
const cors = require('cors');
const app = express();

const PORT = 3000;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'exp://127.0.0.1:19000',
    'exp://localhost:19000',
    'http://10.0.0.234:19000',
    'http://10.0.0.234:3000',
    '*'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

let usuarios = [
  { id: 1, nome: 'Ana Silva', email: 'ana@email.com', tipo: 'estudante' },
  { id: 2, nome: 'Carlos Santos', email: 'carlos@email.com', tipo: 'professor' }
];
let nextId = 3;

app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'API CRUD',
    porta: PORT,
    totalUsuarios: usuarios.length
  });
});

app.get('/usuarios', (req, res) => {
  res.json({
    success: true,
    data: usuarios,
    total: usuarios.length
  });
});

app.get('/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = usuarios.find(u => u.id === id);
  
  if (!usuario) {
    return res.status(404).json({
      success: false,
      error: 'Usuário não encontrado'
    });
  }
  
  res.json({
    success: true,
    data: usuario
  });
});

app.post('/usuarios', (req, res) => {
  const { nome, email, tipo } = req.body;
  
  if (!nome || !email) {
    return res.status(400).json({
      success: false,
      error: 'Nome e email são obrigatórios'
    });
  }

  const novoUsuario = { 
    id: nextId++, 
    nome, 
    email, 
    tipo: tipo || 'estudante' 
  };
  
  usuarios.push(novoUsuario);
  
  res.status(201).json({
    success: true,
    data: novoUsuario,
    message: 'Usuário criado'
  });
});

app.put('/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, email, tipo } = req.body;
  
  const index = usuarios.findIndex(u => u.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Usuário não encontrado'
    });
  }
  
  if (!nome || !email) {
    return res.status(400).json({
      success: false,
      error: 'Nome e email são obrigatórios'
    });
  }
  
  usuarios[index] = {
    ...usuarios[index],
    nome,
    email,
    tipo: tipo || usuarios[index].tipo
  };
  
  res.json({
    success: true,
    data: usuarios[index],
    message: 'Usuário atualizado'
  });
});

app.delete('/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = usuarios.findIndex(u => u.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Usuário não encontrado'
    });
  }
  
  usuarios = usuarios.filter(u => u.id !== id);
  
  res.json({
    success: true,
    message: 'Usuário removido'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});