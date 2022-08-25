const express = require("express");
const app = express();
const mongoose = require("mongoose");

const rutaDocente = require("./routes/rutas-docente");
const rutaCurso = require("./routes/rutas-curso");
const port = 3000;
app.use(express.json());

app.use("/api/cursos", rutaCurso);
app.use("/api/docentes", rutaDocente);

app.use((req, res) => {
  res.status(404).json({
    mensaje: "Error al conectar",
  });
});

mongoose
  .connect(
    "mongodb+srv://Natxafav:Ch0c0late@cluster0.xwnrywd.mongodb.net/docente?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(port, () => console.log("Servidor corriendo en el puerto 3000"));
  })
  .catch((error) => {
    console.log(error.message);
  });
