const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const config = require("../../config.json");

const ERROR_KEY = "error";
const TYPE_KEY = "type";
const TRANSCRIPTION_KEY = "transcription";
const LANGUAGE_KEY = "language";
const SAMPLE_RATE = 48_000;

let socket;
let isListening = false;
let transcriptBuffer = [];

const voiceCommands = {
    "apolo escucha": "/escuchar",
    "apolo guarda": "/guardar",
    "apolo adios": "/stop",
    "apolo estado": "/ping",
    "apolo resumen": "/transcripcion"
};

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
                        // Si está escuchando, almacena la transcripción
                        if (isListening) {
                            transcriptBuffer.push(transcription);
                        }

                        const spokenText = utterance[TRANSCRIPTION_KEY].toLowerCase();
                        console.log(`Texto detectado: ${spokenText}`);

                        for (const [phrase, command] of Object.entries(voiceCommands)) {
                            if (spokenText.includes(phrase)) {
                                console.log(`Ejecutando comando de voz: ${command}`);
                                executeCommand(command, client, channelId);
                                break;
                            }
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

async function executeCommand(command, client, channelId) {
    const channel = client.channels.cache.get(channelId);
    if (!channel) {
        console.error("No se pudo encontrar el canal para enviar el comando");
        return;
    }

    // Obtener la guild y usuario desde el canal
    const guild = channel.guild;
    const user = client.user;

    // Crear un objeto de interacción falso más completo
    const fakeInteraction = {
        guild: guild,
        channel: channel,
        user: user,
        commandName: command.replace('/', ''),  // Convertir el comando a su nombre sin '/'
        reply: async (response) => {
            if (response.files) {
                await channel.send({
                    content: response.content,
                    files: response.files
                });
            } else {
                await channel.send(response.content);
            }
        },
    };

    try {
        switch (command) {
            case "/escuchar":
                require("../comandos/escuchar.js").run(client, fakeInteraction);
                break;
            case "/guardar":
                require("../comandos/guardar.js").run(client, fakeInteraction);
                break;
            case "/stop":
                require("../comandos/stop.js").run(client, fakeInteraction);
                break;
            case "/ping":
                require("../comandos/ping.js").run(client, fakeInteraction);
                break;
            case "/transcripcion":
                console.log("Ejecutando comando /transcripcion a través de voz");
                await require("../comandos/transcription.js").run(client, fakeInteraction);
                break;
            default:
                console.log("Comando no reconocido.");
        }
    } catch (error) {
        console.error(`Error al ejecutar el comando ${command}:`, error);
    }
}


function startListening() {
    isListening = true;
    transcriptBuffer = [];
}

function stopListening() {
    isListening = false;
}

function saveTranscript() {
    const recordingsDir = path.join(__dirname, '../../recordings');
    if (!fs.existsSync(recordingsDir)) {
        fs.mkdirSync(recordingsDir);
    }
    const filePath = path.join(recordingsDir, 'transcript.txt');
    fs.writeFileSync(filePath, transcriptBuffer.join('\n'), 'utf8');
    return filePath;
}

function stopTranscription() {
    if (socket) {
        socket.close();
        socket = null;
    }
}

module.exports = { initGladiaConnection, sendDataToGladia, startListening, stopListening, saveTranscript, stopTranscription };
