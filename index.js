const ffmpeg = require('ffmpeg');
const http = require('http');
const {
    Client,
    Attachment
} = require('discord.js');
const bot = new Client();
const ytdl = require('ytdl-core');
const token = "NjYxMzM2OTI1MzMxNzgzNzAx.XhG9iQ.qeLPlA1OnO-Ye2_js0azgVfpc_A"
const PREFIX = 'patron ';
var song_queue = {};

var express = require('express');
var app     = express();

// http.createServer(onRequest).listen(process.env.PORT || 6000)

// //For avoidong Heroku $PORT error
// app.get('/', function(request, response) {
//     var result = 'App is running'
//     response.send(result);
// }).listen(app.get('port'), function() {
//     console.log('App is running, server is listening on port ', app.get('port'));
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});

bot.on('ready', () =>{
        console.log("Cartel of Medellin is ready!")
        bot.user.setStatus('online')
        bot.user.setActivity('Selling Narcos, puta!')
        // bot.user.setActivity("Samme's kleine piemel")
})

bot.on('message',message =>{
        let args = message.content.substring(PREFIX.length).split(" ");
        switch (args[0]){
            case 'add':

                var song = song_queue[message.guild.id];
                
                song.queue.push(args[1]);


            break;

            case 'play':
                function play(connection, message){
                    var song = song_queue[message.guild.id];
                    song.dispatcher = connection.playStream(ytdl(song.queue[0]), {filter: "audioonly"});
                    song.queue.shift();

                    song.dispatcher.on("end", function(){
                        if(song.queue[0]){
                            play(connection,message);
                        } else {
                            bot.message.send("hijo de puta, I'm out of songs!")
                            connection.disconnect();
                        }
                    });

                }
                message.channel.send("Compadre, I'll play your song after the others in queue!");
                //Check if a URL is given after !play
                if(!args[1]){
                    message.channel.send("estúpido, give me the link to play ah!");
                    return;
                }
                // Check if player is in voice channel
                if(!message.member.voiceChannel){
                    message.channel.reply("Ola idiota, join the voice channel!")
                }

                if(!song_queue[message.guild.id]) song_queue[message.guild.id] = {
                    queue: []
                }

                var song = song_queue[message.guild.id];
                
                song.queue.push(args[1]);
               
                //Check if bot is in voice channel
                if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
            
                    play(connection, message);
                })
            break;
                    
            case 'skip':
                var song = song_queue[message.guild.id];

                if(song.dispatcher) song.dispatcher.end();
                bot.channel.send("Consider the song skipped, patron :gun:")

            break;
            
            case 'stop':
                var song = song_queue[message.guild.id];
                if(message.guild.voiceConnection){
                    for(var i = song.queue.length -1; i >= 0 ; i--){
                        song.queue.splice(i, 1);
                    }
                    song.dispatcher.end();
                }
                if(message.guild.connection) message.guild.voiceConnection.disconnect();

            break;


            case 'join':

                function intro(connection, message){
                    var song = song_queue[message.guild.id];
                    song.dispatcher = connection.playStream(ytdl("https://www.youtube.com/watch?v=3PljW_5xqjg", {filter: "audioonly"}));
                    
                    song.queue.shift();

                    song.dispatcher.on("end", function(){
                        if(song.queue[0]){
                            play(connection,message);
                        } else {
                            connection.disconnect();
                        }
                    });

                }

                message.reply("Ola compadres!")
                if(!message.guild.voiceConnection)message.member.voiceChannel.join().then(function(connection){
                    intro(connection, message,);
                })
            break;

            //This will NOT close the queue list for the bot
            case 'leave':
                message.reply("Adios!");
                message.member.voiceChannel.leave();
            break;

            case 'help':
                message.reply('\nOla! These are the codes, capron!\n---------------\npatron join: Pablo entering Casa de Amigos\npatron start ${URL}: DJ Pablo activated with your Jam (Youtube only) \npatron skip: Puta, this song sucks. Go to the next one in queue!\npatron stop: Patron Pablo leaving the lobby and ends song queue\npatron leave: Pablo leaving but keeps the queue list');
                
            break;
        }

});


bot.login(token);