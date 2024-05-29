const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');
// Importamos la función de manejo de audio
const { startTranscription } = require('../utils/handleVoice');
const config = require("../../config.json");

module.exports = {
    // Definimos la estructura del comando
    data: new SlashCommandBuilder()
        .setName("join")
        .setDescription("El bot se une al canal de voz donde estás conectado"),

    /**
     * 
     * @param {import("discord.js").Client<true>} client 
     * @param {import("discord.js").ChatInputCommandInteraction<"cached">} interaction 
     * @returns {Promise<void>}
     */
    async run(client, interaction) {
        // Verificamos si el usuario está en un canal de voz
        if (!interaction.member.voice.channel) {
            return interaction.reply({ content: "¡Debes unirte a un canal de voz primero!", ephemeral: true });
        }

        const channel = interaction.member.voice.channel;

        try {
            // Unir al canal de voz
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });

            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log('Conexión lista');
            });

            // Escucha al usuario
            const receiver = connection.receiver;
            receiver.speaking.on('start', (userId) => {
                console.log(`Usuario ${userId} comenzó a hablar`);
            });;

            receiver.subscribe(interaction.member.user.id);

            // Llama a la función transcribeAudio
            startTranscription(audioBuffer, config.GLADIA_API);


            // Esperar hasta que la conexión esté lista
            interaction.reply(`¡Conectado al canal de voz ${channel.name} correctamente!`);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: "Hubo un error al unirse al canal de voz.", ephemeral: true });
        }
    }
};
