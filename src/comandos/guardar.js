const { SlashCommandBuilder } = require("discord.js");
const { stopListening, saveTranscript } = require('../utils/handleVoice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("guardar")
        .setDescription("Deja de guardar la transcripción y la guarda en un archivo"),

    async run(client, interaction) {
        stopListening();
        const filePath = saveTranscript();
        interaction.reply({ content: "Perfecto, terminé de escuchar y se guardó el comando \"/transcripcion\"", ephemeral: true });
    }
};
