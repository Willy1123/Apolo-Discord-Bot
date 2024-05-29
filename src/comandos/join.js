const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

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

            // Esperar hasta que la conexión esté lista
            await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
            interaction.reply(`¡Conectado al canal de voz ${channel.name} correctamente!`);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'Hubo un error al intentar conectarse al canal de voz.', ephemeral: true });
        }
    }
};
