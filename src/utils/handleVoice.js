const WebSocket = require('ws');
const config = require("../../config.json");

const ERROR_KEY = "error";
const TYPE_KEY = "type";
const TRANSCRIPTION_KEY = "transcription";
const LANGUAGE_KEY = "language";
const SAMPLE_RATE = 48_000;

let socket;

function initGladiaConnection(client, channelId, userName) {
    const gladiaKey = config.GLADIA_API;
    const gladiaUrl = "wss://api.gladia.io/audio/text/audio-transcription";
    socket = new WebSocket(gladiaUrl);

    socket.on("message", (event) => {
        if (event) {
            const utterance = JSON.parse(event.toString());
            if (Object.keys(utterance).length !== 0) {
                if (ERROR_KEY in utterance) {
                    console.error(`${utterance[ERROR_KEY]}`);
                    socket.close();
                } else {
                    if (utterance && utterance[TRANSCRIPTION_KEY]) {
                        const transcription = `${userName} (${utterance[LANGUAGE_KEY]}): ${utterance[TRANSCRIPTION_KEY]}`;
                        
                        console.log(transcription);

                        // Publica la transcripción en un canal de texto
                        const channel = client.channels.cache.get(channelId);
                        if (channel) {
                            channel.send(transcription);
                        } else {
                            console.error("No se pudo encontrar el canal para enviar la transcripción");
                        }
                    }
                }
            }
        } else {
            console.log("Mensaje vacío...");
        }
    });

    socket.on("error", (error) => {
        console.log("Error en WebSocket:", error.message);
    });

    socket.on("close", () => {
        console.log("Conexión cerrada.");
    });

    socket.on("open", async () => {
        const configuration = {
            x_gladia_key: gladiaKey,
            language_behaviour: "manual",
            language: "spanish",
            sample_rate: SAMPLE_RATE,
        };
        socket.send(JSON.stringify(configuration));
    });

    return socket;
}

function sendDataToGladia(audioBuffer, userSocket) {
    const base64 = audioBuffer.toString('base64');

    if (userSocket.readyState === WebSocket.OPEN) {
        userSocket.send(JSON.stringify({ frames: base64 }));
    } else {
        console.log("WebSocket no está en estado [ OPEN ]");
    }
}

function stopTranscription() {
    if (socket) {
        socket.close();
        socket = null;
    }
}

module.exports = { initGladiaConnection, sendDataToGladia, stopTranscription };
