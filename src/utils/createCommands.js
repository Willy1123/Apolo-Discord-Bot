const fs = require("fs");
const { REST, Routes } = require("discord.js");
const config = require("../../config.json");
const  commands = [];
const slashCommandsFiles = fs.readdirSync("./src/comandos").filter((file) => file.endsWith("js"));


for (const file of slashCommandsFiles) {
    const slash = require(`../comandos/${file}`);
    commands.push(slash.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(config.BOT_TOKEN);

createSlash()

// con esta función agregamos cada comando.js de la carpeta comandos a la lista de comandos
// para su uso futuro en discord.
async function createSlash() {
    try{
        await rest.put(
            //quitando el GUILD_ID serviría de forma global
            Routes.applicationCommands(config.BOT_ID, config.GUILD), {
                body: commands
            }
        )
        console.log("[Slash commands] agregados.");
    } catch (e) {
        console.error(e);
        console.log("Fallo al agregar los Slash commands.");
    }
}