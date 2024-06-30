const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("transcripcion")
        .setDescription("Devuelve el archivo con la transcripción guardada"),

    async run(client, interaction) {
        const filePath = path.join(__dirname, '../../recordings/transcript.txt');
        const file = new AttachmentBuilder(filePath);

        await interaction.reply({
            content: "Aquí tienes la transcripción guardada.",
            files: [file],
            ephemeral: true
        });
    }
};