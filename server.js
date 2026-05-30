// server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { Pelicula, iniciarBD } = require('./db');

const app = express();
const port = process.env.PORT || 3000;

// Clave secreta para firmar y verificar el token
const SECRET_KEY = process.env.JWT_SECRET || 'mi_clave_secreta_peliculas';

// Permite recibir datos JSON
app.use(express.json());

// Middleware logger para ver las peticiones en la terminal
const logger = (req, res, next) => {
    console.log(`${new Date().toLocaleString()} - ${req.method} ${req.url}`);
    next();
};

app.use(logger);

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // Formato esperado: Bearer TOKEN
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            mensaje: 'Token requerido. Debes iniciar sesión primero.'
        });
    }

    jwt.verify(token, SECRET_KEY, (error, usuario) => {
        if (error) {
            return res.status(403).json({
                mensaje: 'Token inválido o expirado.'
            });
        }

        req.usuario = usuario;
        next();
    });
};

// Ruta principal
app.get('/', (req, res) => {
    res.send('API de películas funcionando con JWT');
});

// LOGIN: genera token
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;

    if (usuario === 'admin' && password === '1234') {
        const datosUsuario = {
            id: 1,
            usuario: 'admin',
            rol: 'administrador'
        };

        const token = jwt.sign(datosUsuario, SECRET_KEY, {
            expiresIn: '1h'
        });

        return res.status(200).json({
            mensaje: 'Login exitoso',
            token: token
        });
    }

    res.status(401).json({
        mensaje: 'Usuario o contraseña incorrectos'
    });
});

// Ruta protegida de prueba
app.get('/perfil', verificarToken, (req, res) => {
    res.status(200).json({
        mensaje: 'Acceso autorizado al perfil',
        usuario: req.usuario
    });
});

// GET: obtener todas las películas
// Pública, no requiere token
app.get('/api/peliculas', async (req, res) => {
    try {
        const peliculas = await Pelicula.findAll();
        res.status(200).json(peliculas);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener las películas'
        });
    }
});

// GET: obtener una película por ID
// Pública, no requiere token
app.get('/api/peliculas/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const pelicula = await Pelicula.findByPk(id);

        if (!pelicula) {
            return res.status(404).json({
                error: 'Película no encontrada'
            });
        }

        res.status(200).json(pelicula);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener la película'
        });
    }
});

// POST: crear una nueva película
// Protegida con JWT
app.post('/api/peliculas', verificarToken, async (req, res) => {
    try {
        const { titulo, director, año, genero } = req.body;

        if (!titulo) {
            return res.status(400).json({
                error: 'El título es obligatorio'
            });
        }

        const nuevaPelicula = await Pelicula.create({
            titulo,
            director,
            año,
            genero
        });

        res.status(201).json({
            mensaje: 'Película creada correctamente',
            pelicula: nuevaPelicula,
            usuario: req.usuario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al crear la película'
        });
    }
});

// PUT: actualizar una película por ID
// Protegida con JWT
app.put('/api/peliculas/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, director, año, genero } = req.body;

        const pelicula = await Pelicula.findByPk(id);

        if (!pelicula) {
            return res.status(404).json({
                error: 'Película no encontrada'
            });
        }

        pelicula.titulo = titulo;
        pelicula.director = director;
        pelicula.año = año;
        pelicula.genero = genero;

        await pelicula.save();

        res.status(200).json({
            mensaje: 'Película actualizada correctamente',
            pelicula: pelicula,
            usuario: req.usuario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al actualizar la película'
        });
    }
});

// DELETE: eliminar una película por ID
// Protegida con JWT
app.delete('/api/peliculas/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        const pelicula = await Pelicula.findByPk(id);

        if (!pelicula) {
            return res.status(404).json({
                error: 'Película no encontrada'
            });
        }

        await pelicula.destroy();

        res.status(200).json({
            mensaje: 'Película eliminada correctamente',
            usuario: req.usuario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al eliminar la película'
        });
    }
});

// Iniciar base de datos y servidor
iniciarBD().then(() => {
    app.listen(port, () => {
        console.log('Servidor iniciado en puerto', port);
        console.log('VERSION JWT ACTIVA - RUTAS PROTEGIDAS');
    });
});