const mongoose = require("mongoose");
//Se crea el Schema de mongoose.
const cursoSchema = new mongoose.Schema({
  curso: {
    type: String,
  },
  docente: { type: mongoose.Types.ObjectId, ref: "Docente" },
  opcion: { type: String, enum: ["Presencial", "Virtual", "Semi-presencial"] },
  aula: { type: String, enum: ["Aula-1", "Aula-2", "Aula-3", "Aula-4"] },
  precio: { type: String },
});

module.exports = mongoose.model("Curso", cursoSchema);
