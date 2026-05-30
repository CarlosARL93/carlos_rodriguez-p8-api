// db.js
const { Sequelize, DataTypes } = require('sequelize');

// Crear conexión con SQLite
const db = new Sequelize({
    dialect: 'sqlite',
    storage: './peliculas.sqlite'
});

// Crear modelo Pelicula
const Pelicula = db.define('Pelicula', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    director: {
        type: DataTypes.STRING
    },
    año: {
        type: DataTypes.INTEGER
    },
    genero: {
        type: DataTypes.STRING
    }
});

// Función para iniciar la base de datos
async function iniciarBD() {
    await db.sync();

    const peliculasExistentes = await Pelicula.findAll();

    if (peliculasExistentes.length === 0) {
        await Pelicula.bulkCreate([
            { titulo: 'Iron Man', director: 'Jon Favreau', año: 2008, genero: 'Superhéroes' },
            { titulo: 'Spider-Man', director: 'Sam Raimi', año: 2002, genero: 'Superhéroes' },
            { titulo: 'Avengers: Endgame', director: 'Anthony & Joe Russo', año: 2019, genero: 'Superhéroes' },
            { titulo: 'Capitán América: The First Avenger', director: 'Joe Johnston', año: 2011, genero: 'Superhéroes' },
            { titulo: 'Thor', director: 'Kenneth Branagh', año: 2011, genero: 'Superhéroes' },
            { titulo: 'Black Widow', director: 'Cate Shortland', año: 2021, genero: 'Superhéroes' }
        ]);

        console.log('Películas iniciales agregadas');
    }

    console.log('Base de datos lista');
}

module.exports = { db, Pelicula, iniciarBD };