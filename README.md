<center>
    <img src="/assets/squid-game-logo.png" style="width: auto; height: 150px;" alt="Squid Game" />
</center>

# Twitch Game: Red Light, Green Light

Allows a Twitch streamer to play a game from the popular Netflix series Squid Game in a chat with viewers.

## Players' Rules

During Green Light, viewers can freely chat.
During Red Light, chatting is forbidden—anyone who sends a message will receive a 60-second timeout.

## Features

✅ Automated Chat Moderation – Players who type during "Red Light" get timed out.
✅ Twitch Announcement Integration – The game status is displayed in chat.
✅ Customizable Durations – The streamer can configure the length of red and green phases and length of the game.
✅ Easy to Use – Simple chat commands: only for starting and stopping the game.

## Installation

1. Clone or download this repository.
2. Install dependencies using `npm install`
3. Set up your Twitch API credentials in `.env` file. *You can get Your Twitch Account credentials on https://twitchtokengenerator.com*
4. Run the bot using: `npm start`

## Configuration

Modify settings like timeout duration and game phases in the beginning of the `index.js` file.

## Commands

`!start` - start the game

`!end` - end the game

## License

This project is open-source and available under the **Apache 2.0** license.
*(see [LICENSE file](LICENSE.md))*

## Preview (*in Czech language*)

<img src="/assets/screenshot.png" alt="Screenshot Preview" style="width: auto; height: 100%" />