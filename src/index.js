// Requerimientos
const Discord = require("discord.js");
const { Client } = require("discord.js");
const config = require("../config.json");

// Crea el cliente
const client = new Client({intents: 3244031});

// Contenido
client.on('ready', () => console.log("Estoy listo"));

// Conectar
client.login(config.BOT_TOKEN)