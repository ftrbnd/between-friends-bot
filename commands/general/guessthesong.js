require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('guessthesong')
		.setDescription('Guess the song within 15 seconds!'),
		
	async execute(interaction) {
        const lyricsFolder = path.resolve(__dirname, '../../lyrics');

        const songFiles = fs.readdirSync(lyricsFolder).filter(file => file.endsWith('.txt'));
        let randomSongFile = songFiles[Math.floor(Math.random() * songFiles.length)];
        let songName = randomSongFile.slice(0, -4);

        switch(songName) {
            case "(aux)":
                songName = 'aux'
                break;
        }
        console.log(`guessthesong: ...${songName}...`, );

        let lyrics = await readFile(`${lyricsFolder}/${randomSongFile}`);
        lyrics = lyrics.filter(item => item);
        
        let randomIndex = Math.floor(Math.random() * lyrics.length);
        if(randomIndex === lyrics.length - 1)
            randomIndex--;
        
        const randomLyric = lyrics[randomIndex] + "\n" + lyrics[randomIndex + 1];

        const guessTheSongEmbed = new EmbedBuilder()
            .setTitle(`Guess The Song`)
            // .setThumbnail('')
            .setColor('fa57c1')
            .setDescription(`${randomLyric}`)
            .setFooter({
                text: interaction.guild.name, 
                iconURL: interaction.guild.iconURL({ dynamic : true})
            });
        interaction.reply({ embeds: [guessTheSongEmbed] });

        const filter = m => m.content.toLowerCase().includes(songName.toLowerCase());
        const collector = interaction.channel.createMessageCollector({ filter, time: 15_000 });

        collector.on('collect', m => {
            const winnerEmbed = new EmbedBuilder()
                .setTitle(m.author.username + ' guessed the song!')
                .addFields([
                    { name: 'Song', value: songName}
                ])
                .setDescription(`${randomLyric}`)
                .setThumbnail(m.author.displayAvatarURL({ dynamic : true}))
                .setColor(process.env.CONFIRM_COLOR)
                .setFooter({
                    text: m.guild.name, 
                    iconURL: m.guild.iconURL({ dynamic : true})
                });

            m.reply({ embeds: [winnerEmbed] });
            collector.stop();
        });

        collector.on('end', collected => {
            if(collected.size == 0) {
                const timesUpEmbed = new EmbedBuilder()
                    .setTitle('Nobody guessed the song within 15 seconds.')
                    .addFields([
                        { name: 'Song', value: songName}
                    ])
                    .setDescription(`${randomLyric}`)
                    .setColor(process.env.ERROR_COLOR)
                    .setFooter({
                        text: interaction.guild.name, 
                        iconURL: interaction.guild.iconURL({ dynamic : true})
                    });
                
                interaction.followUp({ embeds: [timesUpEmbed] });
            }
        });
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