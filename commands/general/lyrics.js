require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lyrics')
		.setDescription('Get the lyrics of a song')
        .addStringOption(option =>
            option.setName('song')
            .setDescription('The song to go get the lyrics of')
            .setRequired(true)),
		
	async execute(interaction) {
        let song = interaction.options.getString('song').toLowerCase();

        const lyricsFolder = path.resolve(__dirname, '../../lyrics');
        const songFiles = fs.readdirSync(lyricsFolder).filter(file => file.endsWith('.txt'));

        for(let i = 0; i < songFiles.length; i++) {
            let songName = songFiles[i].slice(0, -4); // remove '.txt'
            switch(songName) { // handle ---- to ????, start--end to start//end, etc.
                case "(aux)":
                    songName = "aux";
                    break;
            }

            if(song === songName.toLowerCase()) {
                const lyrics = await readFile(`${lyricsFolder}/${songFiles[i]}`);
                const lyricsString = lyrics.join('\n');
                song = songName;

                let lyricsEmbed = new EmbedBuilder()
                    .setTitle(songName)
                    .setDescription(lyricsString)
                    .setColor('A569BD');

                return interaction.reply({ embeds: [lyricsEmbed] });
            }
        }

        if(!songFiles.includes(song)) {
            const errEmbed = new EmbedBuilder()
                .setDescription(`**${song}** is not a valid song, please try again!`)
                .setColor(process.env.ERROR_COLOR);
            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }
	},
}

async function readFile(filename) {
    try {
        const contents = await fs.promises.readFile(filename, 'utf-8');
        const arr = contents.split(/\r?\n/);

        return arr;
    } catch(err) {
        console.error(err);
    }
}