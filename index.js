const express = require('express');
const mongoose = require('mongoose');
const db = require('./db'); // conexión Mongo
const app = express();

app.use(express.json());

// 📌 Esquema de usuarios
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

// 📌 Esquema de notas
const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Relación con usuario
  createdAt: { type: Date, default: Date.now }
});

const Note = mongoose.model('Note', noteSchema);

// ✅ Ruta de prueba
app.get('/', (req, res) => {
  res.send('🚀 API funcionando desde VM2 conectado a Mongo en VM1');
});

// ✅ Registrar usuario
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.json({ message: "✅ Usuario registrado con éxito", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: "❌ Credenciales inválidas" });
    }
    res.json({ message: "✅ Login exitoso", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Perfil (obtiene datos del usuario por email enviado en el body)
app.get('/api/profile', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Listar usuarios
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Logout simple
app.post('/api/logout', (req, res) => {
  res.json({ message: "👋 Sesión cerrada con éxito" });
});

/* ------------------ CRUD DE NOTAS ------------------ */

// ✅ Obtener todas las notas
app.get('/api/getNotes', async (req, res) => {
  try {
    const notes = await Note.find().populate('userId', 'username email');
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Obtener una nota por ID
app.get('/api/getNote/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('userId', 'username email');
    if (!note) return res.status(404).json({ error: "Nota no encontrada" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Crear una nueva nota
app.post('/api/getNote', async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    const note = new Note({ title, content, userId });
    await note.save();
    res.json({ message: "✅ Nota creada con éxito", note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Actualizar una nota
app.put('/api/getNote/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );
    if (!note) return res.status(404).json({ error: "Nota no encontrada" });
    res.json({ message: "✅ Nota actualizada con éxito", note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Eliminar una nota
app.delete('/api/getNote/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ error: "Nota no encontrada" });
    res.json({ message: "🗑️ Nota eliminada con éxito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------------------------- */

// 🚀 Iniciar servidor
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en http://0.0.0.0:${PORT}`);
});
