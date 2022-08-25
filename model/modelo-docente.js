const mongoose = require("mongoose");
//const uniqueValidator = require("mongoose-unique-validator");

const docenteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    minLength: 3,
    maxLength: 60,
    required: true,
  },
  email: {
    type: String,
    minLength: 10,
    maxLength: 50,
    required: true,
    //unique: true,
    //crea un índice para email,
  },
  password: {
    type: String,
    trim: true,

    required: true,
  },
  cursos: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Curso",
    },
  ],

  activo: {
    type: Boolean,
    required: true,
  },
});
module.exports = mongoose.model("Docente", docenteSchema);
