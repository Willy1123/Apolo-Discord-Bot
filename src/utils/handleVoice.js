const axios = require('axios');
const fs = require('fs');
const { EndBehaviorType } = require('@discordjs/voice');
const config = require("../../config.json");

async function transcribeAudio(audioBuffer, client, channelId) {
    try {

        const audioBase64 = audioBuffer.toString('base64');
        const audioUrl = `data:audio/wav;base64,${audioBase64}`;

        const response = await axios.post('https://api.gladia.io/v2/transcription', {
            audio_url: audioUrl,
            context_prompt: "<string>",
            custom_vocabulary: ["<string>"],
            detect_language: true,
            enable_code_switching: true,
            code_switching_config: { languages: ["af"] },
            language: "es",
            callback_url: "http://callback.example",
            subtitles: true,
            subtitles_config: { formats: ["srt"] },
            diarization: true,
            diarization_config: { number_of_speakers: 2, min_speakers: 1, max_speakers: 2 },
            summarization: true,
            summarization_config: { type: "general" },
            named_entity_recognition: true,
            chapterization: true,
            name_consistency: true,
            audio_to_llm: true,
            audio_to_llm_config: { prompts: ["Extract the key points from the transcription"] },
            sentences: true
        }, {
            headers: {
                'x-gladia-key': config.GLADIA_API, // Tu clave API aquí
                'Content-Type': 'application/json'
            }
        });

        const transcription = response.data.text;
        console.log(`Transcripción: ${transcription}`);

        // Publica la transcripción en un canal de texto
        const channel = client.channels.cache.get(channelId);
        if (channel) {
            channel.send(transcription);
        } else {
            console.error("No se pudo encontrar el canal para enviar la transcripción");
        }
    } catch (error) {
        console.error("Error al transcribir audio:", error.response ? error.response.data : error.message);
    }
}

module.exports = { transcribeAudio };
