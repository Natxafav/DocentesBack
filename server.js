const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config(); //estamos pidiendo el .env
const cors = require("cors");

const rutaDocente = require("./routes/rutas-docente");
const rutaCurso = require("./routes/rutas-curso");

app.use(express.json());
app.use(cors());
app.use("/api/cursos", rutaCurso);
app.use("/api/docentes", rutaDocente);

app.use((req, res) => {
  res.status(404).json({
    mensaje: "Error al conectar",
  });
});

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => {
    app.listen(process.env.PORT, () => console.log("Servidor corriendo."));
  })
  .catch((error) => {
    console.log(error.message);
  });
