const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pong')
        .setDescription('Replies with Pung!'),
    
	async execute(interaction) {
		await interaction.reply('Pung!');
	},
};