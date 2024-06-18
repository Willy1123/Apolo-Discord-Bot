const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');
const { transcribeAudio } = require('../utils/handleVoice');
const config = require("../../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("join")
        .setDescription("El bot se une al canal de voz donde estás conectado"),

    async run(client, interaction) {
        if (!interaction.member.voice.channel) {
            return interaction.reply({ content: "¡Debes unirte a un canal de voz primero!", ephemeral: true });
        }

        const channel = interaction.member.voice.channel;

        try {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });

            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log('Conexión lista');
                interaction.reply(`¡Conectado al canal de voz ${channel.name} correctamente!`);
                transcribeAudio(connection, client, interaction.channel.id);
            });

            connection.on(VoiceConnectionStatus.Disconnected, () => {
                console.log('Desconectado del canal de voz');
                connection.destroy();
            });

        } catch (error) {
            console.error(error);
            interaction.reply({ content: "Hubo un error al unirse al canal de voz.", ephemeral: true });
        }
    }
};
