require("dotenv").config();

const mongoose = require("mongoose");

const express = require("express");

const Task = require("./models/Task");

const app = express();

const bcrypt = require("bcrypt");

const User = require("./models/user");

const jwt = require("jsonwebtoken");

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB conectado 🚀");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Token requerido"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded;
    next();

  } catch (error) {
    res.status(401).json({
      error: "Token inválido"
    });
  }
}



app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

app.get("/tasks", verificarToken, async (req, res) => {
  try {
    const tasks = await Task.find({
    user: req.user.id
  });

    res.json(tasks);

  } catch (error) {
    res.status(500).json({
      error: "Error al obtener tareas"
    });
  }
});;

app.post("/tasks", verificarToken, async (req, res) => {
  try {

    if (!req.body.title) {
      return res.status(400).json({
        error: "El título es obligatorio"
      });
    }

    const newTask = await Task.create({
    title: req.body.title,
    completed: false,
    user: req.user.id
});
    res.status(201).json(newTask);

  } catch (error) {
    res.status(500).json({
      error: "Error al crear tarea"
    });
  }
});


app.put("/tasks/:id", verificarToken, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body
      },
      {
        new: true
      }
    );

    if (!updatedTask) {
      return res.status(404).json({
        error: "Tarea no encontrada"
      });
    }

    res.json(updatedTask);

  } catch (error) {
    res.status(500).json({
      error: "Error al actualizar tarea"
    });
  }
});

app.delete("/tasks/:id", verificarToken, async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({
        error: "Tarea no encontrada"
      });
    }

    res.json(deletedTask);

  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar tarea"
    });
  }
});

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});

app.post("/register", async (req, res) => {
  try {

    const { username, password } = req.body;

    const existingUser = await User.findOne({
      username
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Usuario ya existe"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Usuario creado"
    });

  } catch (error) {
    res.status(500).json({
      error: "Error al registrar usuario"
    });
  }
});

app.post("/login", async (req, res) => {
  try {

    const { username, password } = req.body;

    const user = await User.findOne({
      username
    });

    if (!user) {
      return res.status(400).json({
        error: "Usuario no encontrado"
      });
    }

    const passwordCorrecta = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordCorrecta) {
      return res.status(400).json({
        error: "Contraseña incorrecta"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    res.json({
      message: "Login correcto",
      token
    });

  } catch (error) {
    res.status(500).json({
      error: "Error al iniciar sesión"
    });
  }
});
