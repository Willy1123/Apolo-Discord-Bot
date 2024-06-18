const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel, VoiceConnectionStatus, EndBehaviorType } = require('@discordjs/voice');
const { initGladiaConnection, sendDataToGladia, stopTranscription } = require('../utils/handleVoice');
const prism = require('prism-media');
const users = {};
const userSockets = {}; // Store user WebSocket connections here

module.exports = {
    data: new SlashCommandBuilder()
        .setName("join")
        .setDescription("El bot se une al canal de voz donde estás conectado"),

    async run(client, interaction) {
        const channel = interaction.member.voice.channel;

        if (!channel) {
            return interaction.reply({ content: "¡Debes unirte a un canal de voz primero!", ephemeral: true });
        }

        try {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: true,
            });

            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log('Conexión lista');
                interaction.reply(`¡Conectado al canal de voz ${channel.name} correctamente!`);

                connection.receiver.speaking.on("start", async userId => {
                    if (!users[userId]) {
                        const userInfos = await client.users.fetch(userId);
                        users[userId] = userInfos;
                    }
                    const userName = users[userId].globalName ?? 'Unknown User';

                    if (!userSockets[userId]) {
                        console.log(`Init new websocket connection for : ${userName}`);
                        userSockets[userId] = initGladiaConnection(client, interaction.channel.id, userName);
                    }

                    const opusDecoder = new prism.opus.Decoder({
                        frameSize: 50960,
                        channels: 1,
                        rate: 48000,
                    });

                    let subscription = connection.receiver.subscribe(userId, { end: {
                        behavior: EndBehaviorType.AfterSilence,
                        duration: 300,
                    }});

                    subscription.pipe(opusDecoder);

                    let audioBuffer = [];
                    opusDecoder.on('data', (chunk) => {
                        audioBuffer.push(chunk);
                    });

                    subscription.once("end", async () => {
                        const lastNineElements = audioBuffer.slice(-9);
                        const repeatedElements = [];
                        for (let i = 0; i < 10; i++) {
                            repeatedElements.push(...lastNineElements);
                        }
                        audioBuffer.push(...repeatedElements);
                        audioBuffer.unshift(...repeatedElements);

                        const concatenated = Buffer.concat(audioBuffer);
                        sendDataToGladia(concatenated, userSockets[userId]); // Pass the user's WebSocket connection
                        audioBuffer = [];
                    });
                });
            });

            connection.on(VoiceConnectionStatus.Disconnected, () => {
                console.log('Desconectado del canal de voz');
                connection.destroy();
                stopTranscription(); // Detener la transcripción al desconectar
            });

        } catch (error) {
            console.error(error);
            interaction.reply({ content: "Hubo un error al unirse al canal de voz.", ephemeral: true });
        }
    }
};
