const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Docente = require("../model/modelo-docente");

// listar todos los docentes.

router.get("/", async (req, res, next) => {
  let docentes;
  try {
    docentes = await Docente.find({}, "-password").populate("cursos");
  } catch (error) {
    const err = new Error(
      "❌No podemos conseguir el listado. Inténtalo más tarde.📛"
    );
    err.code = 500;
    return next(error);
  }
  res.status(200).json({
    mensajes: "Listado de docentes:",
    docentes: docentes,
  });
});

//Conseguir docente por parametro de búsqueda.
router.get("/buscar/:busca", async (req, res, next) => {
  const search = req.params.busca;
  let docentes;
  try {
    docentes = await Docente.find({
      nombre: { $regex: search, $options: "i" }, //regex: nos indica que busquemos en el valor asignado a search y options es para ignorar may o min;
    }).populate("cursos");
  } catch (error) {
    const err = new Error("No se han encontrado los datos solicitados.🔙");
    err.code = 500;
    return next(err);
  }
  res.status(200).json({ mensaje: "Docentes encontrados", docentes: docentes });
});

//Acceder a datos del cliente por email
router.get("/personal/:busca", async (req, res, next) => {
  const search = req.params.busca;
  let docentes;
  try {
    docentes = await Docente.find({
      email: { $regex: search, $options: "i" }, //regex: nos indica que busquemos en el valor asignado a search y options es para ignorar may o min;
    }).populate("cursos");
  } catch (error) {
    const err = new Error("No se han encontrado los datos solicitados.🔙");
    err.code = 500;
    return next(err);
  }
  res.status(200).json({ mensaje: "Docentes encontrados", docentes: docentes });
});

//Conseguir por id
router.get("/:id", async (req, res, next) => {
  const idDocente = req.params.id;
  let docente;

  try {
    docente = await Docente.findById(idDocente).populate("cursos");
  } catch (err) {
    const error = new Error("No se han podido recuperar los datos");
    error.code = 500;
    return next(error);
  }
  if (!docente) {
    const error = new Error("No se ha encontrado el id.");
    error.code = 404;
    return next(error);
  }

  res.status(200).json({
    message: "docente:",
    docente: docente,
  });
});

//Publicar nuevo
router.post("/", async (req, res, next) => {
  const { nombre, email, password } = req.body;
  let existeDocente;
  try {
    existeDocente = await Docente.findOne({
      email: email,
    });
  } catch (error) {
    const err = new Error(error);
    err.code = 401;
    return next(err);
  }

  if (existeDocente) {
    const error = new Error("Ya existe un docente con ese e-mail.");
    error.code = 401; //!Fallo de autenticación.
    return next(error);
  } else {
    //! Aplicar un Hash a la contraseña en texto plano
    //instalar npm i bcryptjs --save para instalar de modo global

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (error) {
      const err = new Error(
        "No se ha podido crear el docente. Inténtelo de nuevo"
      );
      err.code = 500;
      console.log(error.message);
      return next(error);
    }

    const nuevoDocente = new Docente({
      nombre,
      email,
      password: hashedPassword,
      cursos: [],
    });

    try {
      await nuevoDocente.save();
    } catch (err) {
      const error = new Error(
        "No se han podido guardar los datos" + err.message
      );
      error.cod = 500;
      return next(err);
    }
    try {
      token = jwt.sign(
        { userId: nuevoDocente.id, email: nuevoDocente.email },
        "clave_secreta",
        { expiresIn: "1h" }
      );
    } catch (error) {
      const err = new Error("El proceso de alta ha fallado");
      err.code = 500;
      return next(err);
    }
    res.status(201).json({
      userId: nuevoDocente.id,
      email: nuevoDocente.email,
      password: nuevoDocente.password,
      token: token,
    });
  }
});

// ? jwt.sign(payload, clave privada, configuración)

//Modificar
router.patch("/:id", async (req, res, next) => {
  // const { nombre, email, password, cursos} = req.body;
  const camposPorCambiar = req.body;
  const idDocente = req.params.id;
  let docenteBuscar;
  try {
    docenteBuscar = await Docente.findByIdAndUpdate(
      idDocente,
      camposPorCambiar,

      { new: true, runValidators: true }
    ); // (1) Localizamos y actualizamos a la vez el docente en la BDD
  } catch (error) {
    res.status(404).json({
      mensaje: "No se han podido actualizar los datos del docente",
      error: error.message,
    });
  }
  res.status(200).json({
    mensaje: "Docente modificado",
    docente: docenteBuscar,
  });
});

//Eliminar
router.delete("/:id", async (req, res, next) => {
  idEliminar = req.params.id;
  let docenteEliminar;
  // try {
  //   docenteEliminar = await Docente.findByIdAndDelete(idEliminar);
  // } catch (error) {
  //   const err = new Error("Error al eliminar.");
  //   err.code = 500;
  //   return next(error);
  // }

  try {
    docenteEliminar = await Docente.findById(idEliminar);
  } catch (error) {
    const err = new Error(
      "No se han podido eliminar los datos" + error.message
    );
    err.code = 500;
    return next(error);
  }
  if (!docenteEliminar) {
    const error = new Error("No se encuentra ese id.");
    error.code = 404;
    return next(error);
  }
  try {
    await docenteEliminar.remove();
    docenteEliminar.cursos.docente.pull(docenteEliminar);
    await docenteEliminar.cursos.save();
  } catch (error) {
    const err = new Error("Error al eliminar." + error.message);
    error.code = 500;
    return next(error);
  }
  res.json({
    mensaje: "Docente eliminado",
    docente: docenteEliminar,
  });
});

//Login docente
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  let docenteExiste;

  try {
    docenteExiste = await Docente.findOne({
      email: email,
    });
  } catch (error) {
    const err = new Error("No se ha podido loguear. ");
    err.code = 500;
    return next(err);
  }

  if (!docenteExiste) {
    const error = new Error("No se ha podido identificar al docente.");
    error.code = 422; //422 datos de usuario invalidos
    res.json({ docenteok: false });
    return next(error);
  }
  let esValidoPassword = false;
  esValidoPassword = bcrypt.compareSync(password, docenteExiste.password);
  if (!esValidoPassword) {
    const error = new Error(
      "No se ha podido identificar al usuario. Credenciales erróneos"
    );
    error.code = 401; // ! 401: Fallo de autenticación
    res.json({ docenteok: false });
    return next(error);
  }
  //! CREAR EL TOKEN
  try {
    token = jwt.sign(
      {
        userId: docenteExiste.id,
        email: docenteExiste.email,
      },
      "clave_secreta",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new Error("El proceso de login ha fallado." + error.message);
    error.code = 500;
    return next(err);
  }

  res.status(200).json({
    mensaje: "Te has logueado como docente.",
    userId: docenteExiste.id,
    email: docenteExiste.email,
    token: token,
    docenteok: true,
  });
});

module.exports = router;
