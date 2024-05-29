const axios = require('axios');
const fs = require('fs');
const { EndBehaviorType } = require('@discordjs/voice');

async function transcribeAudio(audioBuffer, client, channelId) {
    try {
        const response = await axios.post('https://api.gladia.io/audio/text', audioBuffer, {
            headers: {
                'Authorization': 'Bearer af1fd480-9e15-45ee-8dfd-54b92622bafd',
                'Content-Type': 'audio/wav'
            }
        });

        const transcription = response.data.text;
        console.log(`Transcripción: ${transcription}`);

        // Publica la transcripción en un canal de texto
        client.channels.cache.get("channelId").send(transcripcion);

    } catch (error) {
        console.error("Error al transcribir audio:", error);
    }
}

module.exports = { transcribeAudio };
