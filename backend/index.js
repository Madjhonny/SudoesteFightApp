const express = require("express");
const cors = require("cors");
const pool = require("./db");
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURAÇÃO DO MULTER (PARA UPLOAD DE FOTOS) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Salva os arquivos na pasta 'uploads'
  },
  filename: function (req, file, cb) {
    // Cria um nome de arquivo único para a foto do aluno
    cb(null, req.params.matricula + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- SERVIR ARQUIVOS ESTÁTICOS ---
// Permite que o app acesse as imagens salvas na pasta /uploads através da URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===============================================
// --- ROTAS PRINCIPAIS ---
// ===============================================

// ROTA DE LOGIN
app.post("/api/login", async (req, res) => {
  const { matricula } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM alunos WHERE matricula = $1",
      [matricula]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: "Matrícula inválida" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no servidor ao tentar login." });
  }
});

// ROTA DA AGENDA (Atualizada para também retornar o 'id' da aula)
app.get("/api/agenda", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, dia_semana, horario, modalidade FROM aulas ORDER BY horario");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no servidor ao buscar agenda." });
  }
});

// ROTA PARA UPLOAD DE FOTO DE PERFIL
app.post('/api/alunos/:matricula/foto', upload.single('foto'), async (req, res) => {
  const { matricula } = req.params;
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  const foto_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  try {
    const result = await pool.query(
      "UPDATE alunos SET foto_url = $1 WHERE matricula = $2 RETURNING *",
      [foto_url, matricula]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Aluno não encontrado.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no servidor ao atualizar foto." });
  }
});

// ===============================================
// --- ROTAS PARA O SISTEMA DE CHECK-IN ---
// ===============================================

// ROTA PARA BUSCAR CHECK-INS DE UMA AULA ESPECÍFICA EM UMA DATA
app.get('/api/checkins/aula/:aula_id/data/:data', async (req, res) => {
  const { aula_id, data } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.id, c.aluno_id, a.nome 
       FROM checkins c 
       JOIN alunos a ON c.aluno_id = a.id 
       WHERE c.aula_id = $1 AND c.data_checkin = $2`,
      [aula_id, data]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor ao buscar check-ins.' });
  }
});

// ROTA PARA FAZER UM NOVO CHECK-IN
app.post('/api/checkins', async (req, res) => {
  const { aluno_id, aula_id, data_checkin } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO checkins (aluno_id, aula_id, data_checkin) VALUES ($1, $2, $3) RETURNING *",
      [aluno_id, aula_id, data_checkin]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Código de erro para violação de chave única
      return res.status(409).json({ error: 'Check-in já realizado para esta aula neste dia.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor ao fazer check-in.' });
  }
});

// ROTA PARA CANCELAR UM CHECK-IN
app.delete('/api/checkins', async (req, res) => {
  const { aluno_id, aula_id, data_checkin } = req.body;
  try {
    const result = await pool.query(
      "DELETE FROM checkins WHERE aluno_id = $1 AND aula_id = $2 AND data_checkin = $3",
      [aluno_id, aula_id, data_checkin]
    );
    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Check-in cancelado com sucesso.' });
    } else {
      res.status(404).json({ error: 'Check-in não encontrado para cancelar.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor ao cancelar check-in.' });
  }
});

// --- INICIAR O SERVIDOR ---
app.listen(3000, () => {
  console.log("✅ Servidor rodando em http://localhost:3000");
});

