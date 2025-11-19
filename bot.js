require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
    ]
});
const JOINER_ROLE_ID = '1278337581284589578';
const LVL_ROLE_ID = '1278371918080245855';
const OTHER_ROLE_ID = '1278371975215054881';

const commands = [
    {
        name: 'setup',
        description: 'Set up a reaction-based guide message',
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
console.log('Registering slash commands with the following data:', commands);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

// Event listener for when a new member joins
client.on('guildMemberAdd', async member => {
    const role = member.guild.roles.cache.get(JOINER_ROLE_ID);
    if (role) {
        try {
            await member.roles.add(role);
            console.log(`Assigned the Joiner role to ${member.user.tag}.`);
        } catch (error) {
            console.error(`Failed to assign the Joiner role to ${member.user.tag}:`, error);
        }
    } else {
        console.error('Role not found!');
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'setup') {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Welcome to the Server!')
            // .setDescription('Click a button to get guidance on the right channel.')
            .addFields(
                { name: '⏫ Level Bot', value: 'Click the button to get access to the levelling bot support channel.' },
                { name: '💼 Other', value: 'Click the button to get access to discussions.' }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('level-Bot')
                    .setLabel('⏫ Level Bot')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('other')
                    .setLabel('💼 Other')
                    .setStyle(ButtonStyle.Secondary),
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    const member = interaction.member;

    const lvlrole = member.guild.roles.cache.get(LVL_ROLE_ID);
    const otherrole = member.guild.roles.cache.get(OTHER_ROLE_ID);

    if (!interaction.isButton()) return;

    try {
        if (interaction.customId === 'level-Bot') {
            await member.roles.add(lvlrole);
            await interaction.reply({ content: '⏫ Head over to <#1278346033755066409> for support', ephemeral: true });
        } else if (interaction.customId === 'other') {
            await member.roles.add(otherrole);
            await interaction.reply({ content: '💼 Head over to the <#1278346162264473621> for conversations.', ephemeral: true });
        }
    }
    catch (error) {
        console.log("Error: 1a = Role could not be assigned to startup");
        return interaction.reply({ content: 'error assigning role', ephemeral: true })
    }
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.TOKEN);