const { SlashCommandBuilder } = require("discord.js");
const { startListening } = require('../utils/handleVoice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("escuchar")
        .setDescription("Empieza a escuchar y guardar la transcripción"),

    async run(client, interaction) {
        startListening();
        interaction.reply({ content: "Recivido, empiezo a guardar", ephemeral: true });
    }
};
