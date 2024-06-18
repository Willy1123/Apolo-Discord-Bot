const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require('@discordjs/voice');
const { stopTranscription } = require('../utils/handleVoice');

module.exports = {
    // Definimos la estructura del comando
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("El bot se desconecta del canal de voz"),

    /**
     * 
     * @param {import("discord.js").Client<true>} client 
     * @param {import("discord.js").ChatInputCommandInteraction<"cached">} interaction 
     * @returns {Promise<void>}
     */
    async run(client, interaction) {
        // Obtenemos la conexión actual del canal de voz en la guild
        const connection = getVoiceConnection(interaction.guild.id);

        if (connection) {
            connection.destroy();
            stopTranscription();
            return interaction.reply({ content: "¡Desconectado del canal de voz y transcripción detenida!", ephemeral: true });
        } else {
            return interaction.reply({ content: "No estoy conectado a ningún canal de voz.", ephemeral: true });
        }
    }
};
