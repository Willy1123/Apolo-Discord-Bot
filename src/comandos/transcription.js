const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("transcripcion")
        .setDescription("Devuelve el archivo con la transcripción guardada"),

    async run(client, interaction) {
        const filePath = path.join(__dirname, '../../recordings/transcript.txt');

        // Verificar si el archivo existe antes de enviarlo
        if (!fs.existsSync(filePath)) {
            return interaction.reply({
                content: "No se encontró la transcripción guardada.",
                ephemeral: true
            });
        }

        const file = new AttachmentBuilder(filePath);

        await interaction.reply({
            content: "Aquí tienes la transcripción guardada.",
            files: [file],
            ephemeral: false
        });
    }
};
