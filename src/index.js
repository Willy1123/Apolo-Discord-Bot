// Requerimientos
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const config = require("../config.json");
const fs = require("fs");

// Crear el directorio ./recordings si no existe
const path = './recordings';
if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
}

// Crea el cliente
const client = new Client({ intents: 3244031 });

// Se ejecuta cuando se inicia el Bot
client.on('ready', () => console.log("Estoy listo"));

/**
 * Manejo de slashcommands
 */

let { readdirSync } = require("fs");
client.slashCommands = new Collection();
const slashCommandsFiles = fs
    .readdirSync("./src/comandos")
    .filter(file => file.endsWith("js"));

// Recorremos los archivos de la carpeta commands para cargarlo en la lista de comandos activos
for (const file of slashCommandsFiles) {
    const slash = require(`./comandos/${file}`);
    console.log(`Slash commands - ${file} cargado.`);
    client.slashCommands.set(slash.data.name, slash);
}

// Función para la ejecución de los slashcommands en discord
client.on("interactionCreate", async (interaction) => {

    if (!interaction.isCommand()) return;
    const slashCommands = client.slashCommands.get(interaction.commandName);
    if (!slashCommands) return;

    try {
        await slashCommands.run(client, interaction);
        console.log("Interaction creada!")
    } catch (e) {
        console.error(e);
        console.log("Error al crear la interaction!");
        throw e;
    }

});

// Conectar
client.login(config.BOT_TOKEN)