const express = require('express');
const mongoose = require('mongoose');
const db = require('./db'); // conexión Mongo
const cors = require('cors');

const app = express();

// ✅ Configurar CORS
app.use(cors({
  origin: "http://10.74.110.22:5173", // reemplaza con la IP/puerto de tu frontend
  credentials: true
}));

app.use(express.json());

/* ------------------ MODELOS ------------------ */

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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', noteSchema);

/* ------------------ RUTAS ------------------ */

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

    const token = user._id.toString();

    res.cookie("token", token, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
    });

    res.json({ message: "✅ Usuario registrado con éxito", user, token });
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

    const token = user._id.toString();

    res.cookie("token", token, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
    });
    res.json({ message: "✅ Login exitoso", user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Perfil
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



// ✅ Verificación de sesión
app.get('/api/verify', async (req, res) => {
  try {
    const token = req.headers["authorization"]?.replace("Bearer ", "") || req.query.token;
    if (!token) return res.status(401).json({ error: "❌ Token requerido" });

    const user = await User.findById(token);
    if (!user) return res.status(401).json({ error: "❌ Token inválido" });

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


// ✅ Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie("token");
  res.json({ message: "👋 Sesión cerrada con éxito" });
});

/* ------------------ CRUD DE NOTAS ------------------ */

// Obtener todas las notas
app.get('/api/getNotes', async (req, res) => {
  try {
    const notes = await Note.find().populate('userId', 'username email');
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener una nota por ID
app.get('/api/getNote/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('userId', 'username email');
    if (!note) return res.status(404).json({ error: "Nota no encontrada" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nota
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

// Actualizar nota
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

// Eliminar nota
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
