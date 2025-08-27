const mongoose = require('mongoose');

const DB_USER = "admin";
const DB_PASSWORD = "password123";   // tu contraseña creada en Mongo (VM1)
const DB_HOST = "192.168.1.13";      // IP de la VM1 donde corre MongoDB
const DB_PORT = "27017";             // puerto de MongoDB
const DB_NAME = "appdb";             // puedes usar test o crear una nueva

mongoose.connect(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`)
  .then(() => console.log("✅ Conectado a MongoDB desde VM2"))
  .catch(err => console.error("❌ Error de conexión:", err));

module.exports = mongoose;
