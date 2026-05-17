let tareas = [];
let filtroActual = "todas";


const inputUser = document.querySelector(".input-user");
const inputPassword = document.querySelector(".input-password");
const botonLogin = document.querySelector(".login");
const botonRegister = document.querySelector(".register");
const mensaje = document.querySelector(".mensaje");
const usuarioLogueado = document.querySelector(".usuario-logueado");


const botonLogout = document.querySelector(".logout");
const marcarTodas = document.getElementById("marcarTodas");
const input = document.querySelector(".input-tarea");
const boton = document.querySelector(".agregar");
const lista = document.querySelector(".lista");
const filtroTodas = document.querySelector(".filtro-todas");
const filtroPendientes = document.querySelector(".filtro-pendientes");
const filtroCompletadas = document.querySelector(".filtro-completadas");
const acciones = document.querySelector(".acciones");
const filtros = document.querySelector(".filtros");


botonRegister.addEventListener("click", function () {

    if (inputUser.value.trim() === "" || inputPassword.value.trim() === "") {
    mostrarMensaje("Completá usuario y contraseña", "error");
    return;
    }

    cargando(true);

    fetch("https://todo-fullstack-k6pu.onrender.com/register", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            username: inputUser.value,
            password: inputPassword.value
        })
    })

    .then(function (res) {
        return res.json();
    })

    .then(function (data) {

        cargando(false);

        if (data.error) {
            mostrarMensaje(data.error, "error");
            return;
        }

        mostrarMensaje(data.message, "exito");

    });


});


botonLogin.addEventListener("click", function () {

    cargando(true);

    fetch("https://todo-fullstack-k6pu.onrender.com/login", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            username: inputUser.value,
            password: inputPassword.value
        })
    })

    .then(function (res) {
        return res.json();
    })

    .then(function (data) {

        cargando(false);

        if (data.error) {
            mostrarMensaje(data.error, "error");
            return;
        }

        localStorage.setItem("token", data.token);

        localStorage.setItem("username", inputUser.value);

        mostrarUsuario();

        actualizarUI();

        mostrarMensaje("Login correcto 😎", "exito");

        obtenerTareas();
    });
});

botonLogout.addEventListener("click", function () {

    localStorage.removeItem("token");
    localStorage.removeItem("username");

    mostrarUsuario();

    tareas = [];
    renderizarTareas();

    actualizarUI();

    inputUser.value = "";
    inputPassword.value = "";

    mostrarMensaje("Sesión cerrada", "info");

});

input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        boton.click();
    }
});

function crearTarea(tarea) {
    const nuevaTarea = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = tarea.completed;

    const textoTarea = document.createElement("span");
    textoTarea.textContent = tarea.title;

    textoTarea.addEventListener("click", function () {
    const inputEditar = document.createElement("input");
    inputEditar.value = tarea.title;

    nuevaTarea.replaceChild(inputEditar, textoTarea);
    inputEditar.focus();

    function guardarEdicion() {
        const nuevoTexto = inputEditar.value.trim();

        if (nuevoTexto === "") {
            obtenerTareas();
            return;
        }

        const token = localStorage.getItem("token");

        fetch(`https://todo-fullstack-k6pu.onrender.com/tasks/${tarea._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title: nuevoTexto
            })
        })
            .then(function (res) {
                return res.json();
            })
            .then(function () {
                obtenerTareas();
            });
    }

    inputEditar.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            guardarEdicion();
        }
    });

    inputEditar.addEventListener("blur", function () {
        guardarEdicion();
    });
});

    if (tarea.completed) {
        textoTarea.classList.add("completada");
    }

    checkbox.addEventListener("change", function () {
        const token = localStorage.getItem("token");
        fetch(`https://todo-fullstack-k6pu.onrender.com/tasks/${tarea._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                completed: checkbox.checked
            })
        })
            .then(function (res) {
                return res.json();
            })
            .then(function () {
                obtenerTareas();
            });
    });

    const botonBorrar = document.createElement("button");
    botonBorrar.textContent = "❌";

    botonBorrar.addEventListener("click", function () {
        const token = localStorage.getItem("token");
        fetch(`https://todo-fullstack-k6pu.onrender.com/tasks/${tarea._id}`, {
        method: "DELETE",
        headers: {
        Authorization: `Bearer ${token}`
    }
})
            .then(function () {
                obtenerTareas();
            });
    });

    nuevaTarea.appendChild(checkbox);
    nuevaTarea.appendChild(textoTarea);
    nuevaTarea.appendChild(botonBorrar);

    lista.prepend(nuevaTarea);
}

function renderizarTareas() {
    lista.innerHTML = "";

    let tareasFiltradas = tareas;

    if (filtroActual === "pendientes") {
        tareasFiltradas = tareas.filter(function (t) {
            return !t.completed;
        });
    }

    if (filtroActual === "completadas") {
        tareasFiltradas = tareas.filter(function (t) {
            return t.completed;
        });
    }

    tareasFiltradas.forEach(function (tarea) {
        crearTarea(tarea);
    });
}

function actualizarUI() {

    const token = localStorage.getItem("token");

    if (token) {

        boton.disabled = false;
        input.disabled = false;

        inputUser.style.display = "none";
        inputPassword.style.display = "none";
        botonLogin.style.display = "none";
        botonRegister.style.display = "none";

        botonLogout.style.display = "inline-block";

        acciones.style.display = "flex";
        filtros.style.display = "flex";
        lista.style.display = "block";

    } else {

        boton.disabled = true;
        input.disabled = true;

        inputUser.style.display = "inline-block";
        inputPassword.style.display = "inline-block";
        botonLogin.style.display = "inline-block";
        botonRegister.style.display = "inline-block";

        botonLogout.style.display = "none";

        acciones.style.display = "none";
        filtros.style.display = "none";
        lista.style.display = "none";
    }
}

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = "mensaje " + tipo;
}

function cargando(estado) {
    botonLogin.disabled = estado;
    botonRegister.disabled = estado;

    if (estado) {
        botonLogin.textContent = "Cargando...";
        botonRegister.textContent = "Cargando...";
    } else {
        botonLogin.textContent = "Login";
        botonRegister.textContent = "Registrarse";
    }
}

function mostrarUsuario() {
    const username = localStorage.getItem("username");

    if (username) {
        usuarioLogueado.textContent = `Hola, ${username} 👋`;
    } else {
        usuarioLogueado.textContent = "";
    }
}



function obtenerTareas() {
    const token = localStorage.getItem("token");

    if (!token) {
        tareas = [];
        renderizarTareas();
        return;
    }

    fetch("https://todo-fullstack-k6pu.onrender.com/tasks", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(function (res) {
        return res.json();
    })
    .then(function (data) {
        if (!Array.isArray(data)) {
            tareas = [];
            renderizarTareas();
            return;
        }

        tareas = data;
        renderizarTareas();
    });
}

filtroTodas.addEventListener("click", function () {
    filtroActual = "todas";
    renderizarTareas();
});

filtroPendientes.addEventListener("click", function () {
    filtroActual = "pendientes";
    renderizarTareas();
});

filtroCompletadas.addEventListener("click", function () {
    filtroActual = "completadas";
    renderizarTareas();
});


function iniciarApp() {

    actualizarUI();
    mostrarUsuario();

    const token = localStorage.getItem("token");

    if (token) {
        obtenerTareas();
    } else {
        tareas = [];
        renderizarTareas();
    }
}

iniciarApp();

boton.addEventListener("click", function () {
    const texto = input.value.trim();

    if (texto === "") return;

    const token = localStorage.getItem("token");

    fetch("https://todo-fullstack-k6pu.onrender.com/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            title: texto
        })
    })
    .then(function (res) {
        return res.json();
    })
    .then(function () {
        input.value = "";
        obtenerTareas();
    });
});

marcarTodas.addEventListener("click", function () {
    tareas.forEach(function (tarea) {
        const token = localStorage.getItem("token");
        fetch(`https://todo-fullstack-k6pu.onrender.com/tasks/${tarea._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                completed: true
            })
        });
    });

    setTimeout(function () {
        obtenerTareas();
    }, 300);
});