const express = require("express");
const router = express.Router();
const checkAuth = require("../Middleware/check-auth");

const Curso = require("../model/modelo-curso");
const Docente = require("../model/modelo-docente");

//Conseguir todos.
router.get("/", async (req, res, next) => {
  let curso;
  try {
    curso = await Curso.find({}).populate("docente");
  } catch (error) {
    const err = new Error("Ha ocurrido un error en la recuperación de cursos");
    err.code = 500;
    return next(error);
  }

  res.status(200).json({
    mensaje: "Todos los cursos",
    cursos: curso,
  });
});

//Conseguir por id
router.get("/:id", async (req, res, next) => {
  const idCurso = req.params.id;
  let curso;
  try {
    curso = await Curso.findById(idCurso).populate("docente");
  } catch (err) {
    const error = new Error("No se han podio recuperar los datos.");
    error.code = 500;
    return next(error);
  }
  res.json({
    message: "Curso:",
    curso: curso,
  });
});
//Buscar por parametro

// //!Midelware
// router.use(checkAuth);

//Publicar nuevo
router.post("/", async (req, res, next) => {
  const { curso, docente, opcion, aula, precio } = req.body;

  let localizarDocente;
  let verificarCurso;

  try {
    localizarDocente = await Docente.findById(docente).populate("cursos");

    verificarCurso = await Curso.findOne({
      curso: curso,
      opcion: opcion,
    });
  } catch (err) {
    res.status(500).json({
      mensaje: "Ha fallado la operación",
      error: err.message,
    });
  }
  //!Si el docente no está en la base de datos.
  if (!localizarDocente) {
    const error = new Error("El docente no existe o no se ha localizado.");
    error.code = 404;
    return next(error);
  }
  if (verificarCurso) {
    const error = new Error("El curso ya está creado");
    error.code = 404;
    return next(error);
  }
  const nuevoCurso = new Curso({ curso, docente, opcion, aula, precio });
  try {
    await nuevoCurso.save(); //Creamos el curso y lo guardamos
    localizarDocente.cursos.push(nuevoCurso);
    await localizarDocente.save();
  } catch (error) {
    const err = new Error("Error. Ha fallado la operación.");
    err.code = 404;
    return next(error);
  }

  res.status(201).json({
    mensaje: "Curso agregado",
    curso: nuevoCurso,
  });
});

//Modificar
router.patch("/:id", async (req, res, next) => {
  const idCurso = req.params.id;
  let cursoBuscar;
  try {
    cursoBuscar = await Curso.findById(idCurso).populate("docente");
    if (req.body.docente) {
      cursoBuscar.docente.cursos.pull(cursoBuscar);
      await cursoBuscar.docente.save();
      docenteBuscar = await Docente.findById(req.body.docente);
      docenteBuscar.cursos.push(cursoBuscar);
      docenteBuscar.save();
    }
    cursoBuscar = await Curso.findByIdAndUpdate(idCurso, req.body, {
      new: true,
      runValidators: true,
    });

    // docenteBuscar = await Docente.findById(req.body.docente);
    // docenteBuscar.cursos.push(cursoBuscar);
    // docenteBuscar.save();
  } catch (error) {
    console.log(error.message);
    const err = new Error(
      "Ha ocurrido un error. No se han podido actualizar los datos"
    );
    console.log(error);
    error.code = 500;
    return next(err);
  }
  res.status(200).json({
    mensaje: "Curso modificado",
    curso: cursoBuscar,
  });
});

//Eliminar
router.delete("/:id", async (req, res, next) => {
  idEliminar = req.params.id;
  let cursoEliminar;
  try {
    cursoEliminar = await Curso.findById(idEliminar).populate("docente");
  } catch (error) {
    const err = new Error("No se ha podido acceder");
    error.code = 500;
    return next(err);
  }
  if (!cursoEliminar) {
    const error = new Error("No se encuentra el curso.");
    error.status = 404;
    return next(error);
  }
  try {
    await cursoEliminar.remove();
    cursoEliminar.docente.cursos.pull(cursoEliminar);
    await cursoEliminar.docente.save();
  } catch (error) {
    const err = new Error("Intentalo de nuevo más tarde.");
    err.code = 500;
    return next(error);
  }
  res.json({
    mensaje: "Curso eliminado",
    // curso: cursoEliminar,
  });
});

module.exports = router;
