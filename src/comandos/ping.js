const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    // definimos la estructura del comando
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("El bot responde con su ping en ms."),

    /**
     *
     * @param {import("discord.js").Client<true>} client
     * @param {import("discord.js").ChatInputCommandInteraction<"cached">} interaction
     * @returns {Promise<void>}
     */
    async run(client, interaction) {
        interaction.reply({content: `Pong! Mi Latencia es de **${client.ws.ping} ms**.`});
    }
}