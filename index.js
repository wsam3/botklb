const express = require('express');
const app = express();
app.listen(() => console.log('Done'));
app.use('/ping', (req, res) => {
    res.send(new Date());
});


app.get('/', (req, res) => {
	res.send('Hello Express app!');
});
const { OpusEncoder } = require('@discordjs/opus');


const { SoundCloudPlugin } = require('@distube/soundcloud')
const { SpotifyPlugin } = require('@distube/spotify')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

require("events").EventEmitter.defaultMaxListeners = 9999999999999999999999999999;
const Discord = require('discord.js');
// const client = new Discord.Client();
const DisTube = require('distube');
const ms = require('ms')
const fs = require('fs')
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES ,Intents.FLAGS.GUILD_MESSAGE_REACTIONS,Intents.FLAGS.GUILD_VOICE_STATES] });
const { YtDlpPlugin } = require("@distube/yt-dlp")
// const distube = new DisTube({ plugins: [new YtDlpPlugin()] })
 require("ffmpeg-static");
const ytdl = require("ytdl-core");


const default_prefix = "1"
const owners = "734806087215349871"
const vip = "734806087215349871"
const distube = new DisTube.default(client)




prefix= "1"

const queue = new Map();
client.on('messageCreate', message => {
  let SerPrefix = db.get(`prefix_${message.guild.id}`);
if(SerPrefix === null) SerPrefix = default_prefix;
  if (message.author.bot || !message.inGuild()) return
  if (!message.content.startsWith(default_prefix)) return
  const args = message.content.slice(default_prefix.length).trim().split(/ +/g)
  const command = args.shift()

  if (command.toLowerCase() === 'play'||command.toLowerCase() === 'p') {
      const voiceChannel = message.member.voice.channel
      if (voiceChannel) {
          distube.play(voiceChannel, args.join(' '), {
              message,
              textChannel: message.channel,
              member: message.member,
          })
      } else {
          message.channel.send(
              'You must join a voice channel first.',
          )
      }
  }

  if ([SerPrefix+'repeat', SerPrefix+'loop'].includes(command)) {
      const mode = distube.setRepeatMode(message)
      message.channel.send(
          `Set repeat mode to \`${
              mode
                  ? mode === 2
                      ? 'All Queue'
                      : 'This Song'
                  : 'Off'
          }\``,
      )
  }

  if (command.toLowerCase() === 'stop'||command === 'st') {
      distube.stop(message)
      message.channel.send('Stopped the music!').catch((rr)=>{
        console.log(`Error `)
      })
  }

  if (command.toLowerCase() === 'leave'||command === 'play') {
      distube.voices.get(message)?.leave()
      message.channel.send('Leaved the voice channel!').catch((rr)=>{
        console.log(`Error `)
      })
  }

  if (command.toLowerCase() === 'resume') distube.resume(message).catch((rr)=>{
    console.log(`Error `)
  })

  if (command.toLowerCase() === 'volume'){
    const args = message.content.slice(default_prefix.length).trim().split(/ +/g).join(' ')
     distube.setVolume(message,args)
    message.channel.send(`Done Change Volume To ${args}`)
    }

  if (command.toLowerCase() === 'pause') distube.pause(message).catch((rr)=>{
    console.log(`Error `)
  })

  if (command.toLowerCase() === 'skip'||command.toLowerCase() === 's') distube.voices.get(message)?.leave().catch((rr)=>{
    console.log(`Error `)
  })

  if (command.toLowerCase() === 'queue'||command.toLowerCase() === 'p') {
      const queue = distube.getQueue(message)
      if (!queue) {
          message.channel.send('Nothing playing right now!')
      } else {
          message.channel.send(
              `Current queue:\n${queue.songs
                  .map(
                      (song, id) =>
                          `**${id ? id : 'Playing'}**. ${
                              song.name
                          } - \`${song.formattedDuration}\``,
                  )
                  .slice(0, 10)
                  .join('\n')}`,
          )
      }
  }

  if (
      [
          '3d',
          'bassboost',
          'echo',
          'karaoke',
          'nightcore',
          'vaporwave',
      ].includes(command)
  ) {
      const filter = distube.setFilter(message, command)
      message.channel.send(
          `Current queue filter: ${filter.join(', ') || 'Off'}`,
      )
  }
})

// Queue status template
const status = queue =>
  `Volume: \`${queue.volume}%\` | Filter: \`${
      queue.filters.join(', ') || 'Off'
  }\` | Loop: \`${
      queue.repeatMode
          ? queue.repeatMode === 2
              ? 'All Queue'
              : 'This Song'
          : 'Off'
  }\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``

// DisTube event listeners, more in the documentation page
distube
  .on('playSong', (queue, song) =>
      queue.textChannel?.send(
          `Playing \`${song.name}\` - \`${
              song.formattedDuration
          }\`\nRequested by: ${song.user}\n${status(queue)}`,
      ),
  )
  .on('addSong', (queue, song) =>
      queue.textChannel?.send(
          `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`,
      ),
  )
  .on('addList', (queue, playlist) =>
      queue.textChannel?.send(
          `Added \`${playlist.name}\` playlist (${
              playlist.songs.length
          } songs) to queue\n${status(queue)}`,
      ),
  )
  .on('error', (textChannel, e) => {
      console.error(e)
      textChannel.send(
          `An error encountered: ${e.message.slice(0, 2000)}`,
      )
  })
  .on('finish', queue => queue.textChannel?.send('Finish queue!'))
  .on('finishSong', queue =>
      queue.textChannel?.send('Finish song!'),
  )
  .on('disconnect', queue =>
      queue.textChannel?.send('Disconnected!'),
  )
  .on('empty', queue =>
      queue.textChannel?.send(
          'The voice channel is empty! Leaving the voice channel...',
      ),
  )
  // DisTubeOptions.searchSongs > 1
  .on('searchResult', (message, result) => {
      let i = 0
      message.channel.send(
          `**Choose an option from below**\n${result
              .map(
                  song =>
                      `**${++i}**. ${song.name} - \`${
                          song.formattedDuration
                      }\``,
              )
              .join(
                  '\n',
              )}\n*Enter anything else or wait 30 seconds to cancel*`,
      )
  })
  .on('searchCancel', message =>
      message.channel.send('Searching canceled'),
  )
  .on('searchInvalidAnswer', message =>
      message.channel.send('Invalid number of result.'),
  )
  .on('searchNoResult', message =>
      message.channel.send('No result found!'),
  )
  .on('searchDone', () => {})



client.on('messageCreate',message=>{
   let SerPrefix = db.get(`prefix_${message.guild.id}`); 
  if (SerPrefix === null) SerPrefix = default_prefix;
  if (message.content.toLowerCase()== SerPrefix+"idle"){
    
    client.user.setStatus('idle').then(
      message.channel.send(`Done Change My Status`)
    )
  }

  if (message.content.toLowerCase() == SerPrefix+"dnd"){
    client.user.setStatus('dnd').then(
      message.channel.send(`Done Change My Status`)
    )
  }
  if(message.content.toLowerCase()== SerPrefix+"online"){
    client.user.setStatus('online').then(
      message.channel.send(`Done Change My Status`)
    )
  }
  })




const db = require('quick.db');



client.on('messageCreate',message=>{
  if(message.content.toLowerCase().startsWith("sethelp")){
    if (!message.author.id == "920774163663294475")return ; 
    const args = message.content.split(" ").slice(1).join(" ")
    if(!args) return message.channel.send(`Enter Any Text`)
    db.set(`newhelp`,args)
      message.channel.send(`Done Change Help Command`)
  }
})

client.on('messageCreate',message=>{
  let SerPrefix = db.get(`prefix_${message.guild.id}`); 
  if (SerPrefix === null) SerPrefix = default_prefix;
  if (message.content.toLowerCase() == SerPrefix+"help"){
    const args = message.mentions.members.first();
    const vc = db.get(`server_${message.guild.id}_${args}`);
    if(message.author.id == vc )return ; 
    const vb = db.get(`newhelp`)
    if(!vb){
      message.channel.send(`**Music Commands :**\n**> \`${SerPrefix}play|p|\` : تشغيل أغنية وتثبيت البوت في الروم\n> \`${SerPrefix}stop|st|\` : إيقاف الاغاني ويمسح قائمة التشغيل\n> \`${SerPrefix}skip|s|\` : تخطي للأغنية التالية في القائمة\n> \`${SerPrefix}volume|v|\` : تغيير درجة الصوت من 1 الى  150\n> \`${SerPrefix}nowplaying|np\` : تخطي للأغنية التالية في القائمة\n> \`${SerPrefix}Pause\` : إيقاف الأغنية مؤقتاً\n> \`${SerPrefix}queue|q\` :  عرض قائمة التشغيل\n> \`${SerPrefix}repeat|loop|\` : تكرار الأغنية أو قائمة التشغيل\n Owner Commands : \n> \`${SerPrefix}vip\` : لإظهار المالك الخاص بالبوت\n> \`${SerPrefix}addowner\` : لإضافه مالك جديد للبوت \n> \`${SerPrefix}removeowner\` : لإزالة مالك من البوت \n> \`${SerPrefix}cheak\` : لفحص ما إذا كان العضو اونر بالبوت أم لا**`)
  } else{
    message.channel.send(vb)
  }
  }
})

client.on('messageCreate',message=>{
  let SerPrefix = db.get(`prefix_${message.guild.id}`); 
 if (SerPrefix === null) SerPrefix = default_prefix;
 if (message.content.toLowerCase()== SerPrefix+"idle"){
   
   client.user.setStatus('idle').then(
     message.channel.send(`Done Change My Status`)
   )
 }

 if (message.content.toLowerCase() == SerPrefix+"dnd"){
   client.user.setStatus('dnd').then(
     message.channel.send(`Done Change My Status`)
   )
 }
 if(message.content.toLowerCase()== SerPrefix+"online"){
   client.user.setStatus('online').then(
     message.channel.send(`Done Change My Status`)
   )
 }
 })





client.on('messageCreate',message => {
let SerPrefix = db.get(`prefix_${message.guild.id}`);
if(SerPrefix === null) SerPrefix = default_prefix;
if(message.content.startsWith(SerPrefix + 'setprefix')){
if(db.get(`addlist_${message.author.id}`) == `${message.author.id}`) return 
  const args = message.content.split(' ').slice(1).join(' ');
  if (!args)
			return message.channel.send(`_' Type the prefix._`);
  db.set(`prefix_${message.guild.id}`,args);
  message.channel.send(`_The prfix has been changed to_ ** ${args} **`)
  return;
}
})
client.on('messageCreate', message => {
let SerPrefix = db.get(`prefix_${message.guild.id}`);
if (SerPrefix === null) SerPrefix = default_prefix;
if (message.content.startsWith(SerPrefix + 'serprefix')) {
  message.channel.send(`_Server Prefix is :_ ** ${SerPrefix} **`);
}
})
//ملاحظة في كل كود حط هذول الاسطر
// let SerPrefix = db.get(`prefix_${message.guild.id}`);
// if (SerPrefix === null) SerPrefix = default_prefix;
// لاستعمال البريفكس (SerPrefix)




client.on('messageCreate',message => {
let SerPrefix = db.get(`prefix_${message.guild.id}`);
if(SerPrefix === null) SerPrefix = default_prefix;
if (message.content === SerPrefix + "come" || message.content.startsWith(SerPrefix + "تعال")) {
if(!message.member.hasPermission('ADMINISTRATOR')) return 

if (!message.member.voice.channel)
			return message.channel.send(`_Connect to voice ._`);
 
 db.set(`afk_${message.guild.id}`, message.member.voice.channel.id)
 
  message.channel.send(`_Done New channel is set:_ **${message.member.voice.channel.name}**`)
  return;
}
})

client.on('messageCreate',message => {
let SerPrefix = db.get(`prefix_${message.guild.id}`);
if(SerPrefix === null) SerPrefix = default_prefix;
if (message.content === `<@!${client.user.id}>come` || message.content.startsWith(`<@!${client.user.id}>تعال`)) {
if(!message.member.hasPermission('ADMINISTRATOR')) return 

if (!message.member.voice.channel)
			return message.channel.send(`_Connect to voice ._`);
 
 db.set(`afk_${message.guild.id}`, message.member.voice.channel.id)
 
  message.channel.send(`_Done New channel is set:_ **${message.member.voice.channel.name}**`)
  return;
}
})





client.on('messageCreate',message => {
	let SerPrefix = db.get(`prefix_${message.guild.id}`);
	if(SerPrefix === null) SerPrefix = default_prefix;
	if (message.content === `<@!${client.user.id}>leave` || message.content.startsWith(`<@!${client.user.id}>اخرج`)) {
	if(!message.member.hasPermission('ADMINISTRATOR')) return 
	
	if (!message.member.voice.channel)
				return message.channel.send(`_Connect to voice ._`);
	 
				if(message.guild.me.voice.channel){
					message.guild.me.voice.channel.leave()
					db.delete(`afk_${message.guild.id}`)
				}
	  message.channel.send(`_Done, static **channel** is removed_`)
	  return;
	}
	})


  client.on('messageCreate',message => {
if(message.content.startsWith(`<@!${client.user.id}>setprefix`)){
if(db.get(`addlist_${message.author.id}`) == `${message.author.id}`) return 
  const args = message.content.split(' ').slice(1).join(' ');
  if (!args)
  return message.channel.send(`_' Type the prefix._`);
  db.set(`prefix_${message.guild.id}`,args);
  message.channel.send(`_The prfix has been changed to_ ** ${args} **`)
  return;
}
})
client.on('messageCreate', message => {
let SerPrefix = db.get(`prefix_${message.guild.id}`);
if (SerPrefix === null) SerPrefix = default_prefix;
if (message.content.startsWith(SerPrefix + 'serprefix')) {
  message.channel.send(`_Server Prefix is :_ ** ${SerPrefix} **`);
}
})





  
client.on('messageCreate',message=>{
  let SerPrefix = db.get(`prefix_${message.guild.id}`);
if (SerPrefix === null) SerPrefix = default_prefix;
  const dev = "920774163663294475"
  if (message.content.toLowerCase()== SerPrefix+"vip"){
  message.channel.send(`*Registered For :* <@${dev}>`)
}
})
	
  client.on('messageCreate', proman => {
    let SerPrefix = db.get(`prefix_${proman.guild.id}`);
if (SerPrefix === null) SerPrefix = default_prefix;
  if (proman.content.toLowerCase().startsWith(SerPrefix + "botavatar")) {
  let args = proman.content.split(" ").slice(1).join(" ")
    let user = proman.author;
    if (!user) user = proman.author
    const cheak = db.get(`server_${proman.guild.id}_${user}`)
    if(proman.author.id !== cheak) return proman.channel.send(`لا تفل ها , الامر ذا للكبار ما ينفع لك `)
    if (!args)
      return proman.channel.send(
        `** :x: Please Provide me an avatar for the bot !**`
      );
    client.user.setAvatar(`${args}`);
    proman.channel.send(`Changing The bot's Avatar ...`).then(mr => {
      mr.edit(`**Done !.**`);
    });
  }
})





setInterval(() => {
client.guilds.cache.forEach(g => {
client.channels.cache.forEach(c => {
let channel = g.channels.cache.get(db.get(`afk_${g.id}`));
if(channel) {
channel.join().catch(e => {
console.error(e);
});	 
}
})
})
}, 1)

client.on('messageCreate',message => {
let SerPrefix = db.get(`prefix_${message.guild.id}`);
if(SerPrefix === null) SerPrefix = default_prefix;
if(message.content.startsWith(SerPrefix + 'setprefix')){
if(db.get(`addlist_${message.author.id}`) == `${message.author.id}`) return 
  const args = message.content.split(' ').slice(1).join(' ');
  if (!args)
			return message.channel.send(`_' Type the prefix._`);
  db.set(`prefix_${message.guild.id}`,args);
  message.channel.send(`_The prfix has been changed to_ ** ${args} **`)
  return;
}
})


client.on('messageCreate',message =>{
  let SerPrefix = db.get(`prefix_${message.guild.id}`);
if(SerPrefix === null) SerPrefix = default_prefix;
  if (message.content.toLowerCase().startsWith(SerPrefix+"setplay")){
    const dbb = db.get(`server_${message.guild.id}_${message.author.id}`)
    if(!dbb) return ; 
    if(!message.author.id == dbb) return ;
    const args = message.content.split(" ").slice(1).join(" ")
    client.user.setActivity(args , {type : 'PLAYING' , }).then(
      message.channel.send(`*Done Change My Game *`)
    )
  }
})
client.on('messageCreate',message =>{
  let SerPrefix = db.get(`prefix_${message.guild.id}`);
if(SerPrefix === null) SerPrefix = default_prefix;
  if (message.content.toLowerCase().startsWith(SerPrefix+"setstream")){
    const dbb = db.get(`server_${message.guild.id}_${message.author.id}`)
    if(!dbb) return ; 
    if(!message.author.id == dbb) return ;
    const args = message.content.split(" ").slice(1).join(" ")
    client.user.setActivity(args , {type : 'STREAMING' , }).then(
      message.channel.send(`*Done Change My Streaming* `)
    )
  }
})


client.on('messageCreate',message=>{
    let SerPrefix = db.get(`prefix_${message.guild.id}`);
if(SerPrefix === null) SerPrefix = default_prefix;
  if(message.content.toLowerCase().startsWith(SerPrefix+"addowner")){
    const dbb = db.get(`server_${message.guild.id}_${message.author.id}`)
    if(!dbb) return ; 
    if(!message.author.id == dbb)return;
    const args = message.mentions.members.first();
    db.set(`server_${message.guild.id}_${args}`,args.id)
    message.channel.send(`*Done Add New Owner To Me*`)
  }
})
client.on('messageCreate',message=>{
    let SerPrefix = db.get(`prefix_${message.guild.id}`);
if(SerPrefix === null) SerPrefix = default_prefix;
  if(message.content.toLowerCase().startsWith(SerPrefix+"removeowner")){
      const dbb = db.get(`server_${message.guild.id}_${message.author.id}`)
      if(!dbb) return ; 
      if(!message.author.id == dbb)return;
    const args = message.mentions.members.first();
    db.delete(`server_${message.guild.id}_${args}`,args.id)
    message.channel.send(`*Done Delete ${args} From A Bot Owner*`)
  }
})

client.on('messageCreate',message=>{
      let SerPrefix = db.get(`prefix_${message.guild.id}`);
if(SerPrefix === null) SerPrefix = default_prefix;
  if (message.content.toLowerCase().startsWith(SerPrefix+"cheak")){
     const args = message.mentions.members.first();
    const cheek = db.get(`server_${message.guild.id}_${args}`)
    if(!cheek){
      message.channel.send(`*Is Not Owner Me*`)
    }else {
      message.channel.send(`*It's Owner Me*`)
    }
  }
})









client.login('OTQ4NTM0MzI2MjU2MTAzNDM0.Yh9Nbg.y-cVb5TL-hbNRJ2b0Nh7VIRBsNM')