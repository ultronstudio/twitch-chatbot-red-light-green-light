const tmi = require('tmi.js');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Setting up a Twitch chat client from tmi.js
const client = new tmi.Client({
    connection: {
        secure: true,
        reconnect: true
    },
    identity: {
        username: `${process.env.CLIENT_NAME}`,
        password: `oauth:${process.env.CLIENT_SECRET}`
    },
    clientId: `${process.env.CLIENT_ID}`,
    channels: [`${process.env.CHANNEL_NAME}`]
});

// Variables for the game
let gameRunning = false;
let gameTime = 60 * 1000; // 1 minute
let redLight = false;
let playersInGame = new Set();
let timeoutList = new Set();
var userId = 0; // ID of the user who will be eliminated, it resets after every round

/**
 * Start the game
 * @param {*} channel In what channel the game will be started
 */
function startGame(channel) {
    if (gameRunning) return; // If the game is already running, don't start another one

    // Reset all variables
    playersInGame.clear();
    timeoutList.clear();
    redLight = false;
    userId = 0;

    gameRunning = true;
    timeoutList.clear();
    playersInGame.clear();

    // Inform the chat about that the game is starting
    client.say(channel, 'You\'re gonna play Red Light, Green Light. You can chat when he shouts "Green Light", and stop chatting when he shouts "Red Light". If your message is detected on "Red Light", you will be eliminated.');

    // After the game time (set in gameTime), the game will end
    setTimeout(() => {
        endGame(channel);
    }, gameTime);

    // Changing the light every 4 seconds; for smooth play
    const gameInterval = setInterval(() => {
        redLight = !redLight;
        if (redLight) {
            client.say(channel, '🔴 Red Light!');
        } else {
            client.say(channel, '🟢 Green Light!');
        }
    }, 4000);

    // After the game time, the game will end and the interval will be cleared
    setTimeout(() => {
        clearInterval(gameInterval);
    }, gameTime);
}

/**
 * End the game
 * @param {*} channel In what channel the game will end
 */
function endGame(channel) {
    gameRunning = false;

    // Announce the winners or no winners at the end of a round
    const winners = [...playersInGame].filter(player => !timeoutList.has(player));

    if (winners.length > 0) {
        client.say(channel, `Congratulations to the winners: ${winners.join(', ')}`);
    } else if(winners.length == 0) {
        client.say(channel, 'No one attended the games 😢');
    } else {
        client.say(channel, 'Nobody won! 😢');
    }
}

/**
 * Adding a player to the participants
 * @param {*} username The username of participant
 */
function addPlayer(username) {
    if (!playersInGame.has(username)) {
        playersInGame.add(username);
    }
}

/**
 * Checking messages and eliminating players
 * @param {*} username Username of the player who was eliminated
 * @param {*} channel Channel where the player is eliminated
 */
async function checkPlayerMessage(username, channel) {
    if (redLight && !timeoutList.has(username)) {
        timeoutList.add(username);

        const usernameToId = {
            method: 'GET',
            url: 'https://api.twitch.tv/helix/users?login=' + username,
            headers: {
                'Authorization': 'Bearer 20qfhksq0fo7blmox4ibfed2qglda4',
                'Client-Id': 'gp762nuuoqcoxypju8c569th9wz7q5'
            },
        };

        // Send the request to get user ID
        await axios(usernameToId)
            .then(response => {
                userId = response.data.data[0].id;
                console.log('ID: ' + userId);
            })
            .catch(error => {
                console.error(error);
            });

            console.log('UID: ' + userId);
        
        // Request options for eliminate the user
        const options = {
            method: 'POST',
            url: 'https://api.twitch.tv/helix/moderation/bans?broadcaster_id=635844208&moderator_id=635844208',
            headers: {
                'Authorization': `Bearer 20qfhksq0fo7blmox4ibfed2qglda4`,
                'Client-Id': 'gp762nuuoqcoxypju8c569th9wz7q5',
                'Content-Type': 'application/json'
            },
            data: {
                data: {
                    user_id: userId,
                    reason: 'Na červenou nesmíš psát!',
                    duration: gameTime // The player is eliminated for longer than the game time remaining, to prevent him from "mysteriously" reviving.
                }
            }
        };

        // Send the "elimination" request to API
        await axios(options)
            .then(response => {
                // console.log(response.data);
                client.say(channel, `❌ Player ${username} has been eliminated`);
            })
            .catch(error => {
                // console.error(error);
                client.say(channel, `✅ Player ${username} escaped elimination`);
            });
    }
}

// Retrieving messages from chat
client.on('message', (channel, tags, message, self) => {
    const username = tags.username;

    // Only the streamer can start the game
    if (!gameRunning && username === process.env.CLIENT_NAME) {
        if (message.toLowerCase() === '!start') {
            startGame(channel); //Start the game
        }
        return;
    }

    // Only the streamer can end the game
    if (gameRunning && username === process.env.CLIENT_NAME) {
        if (message.toLowerCase() === '!end') {
            endGame(channel); // End the game
        }
        return;
    }

    // We don't want the streamer to be eliminated (although that's not possible).
    if (username !== process.env.CLIENT_NAME) {
        addPlayer(username);
        checkPlayerMessage(username, channel);
    }
});

// Connect to the Twitch chat (tmi.js)
client.connect().then(() => {
    console.log(`Red Light, Green Light is ready to play on Twitch channel ${process.env.CLIENT_NAME}`);
});
