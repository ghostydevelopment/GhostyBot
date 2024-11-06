@echo off
setlocal enabledelayedexpansion

set "configFile=../data/config.example.json"

echo Please answer the following questions to configure your settings:

set /p botToken="Enter the bot token: "
set /p discordClientID="Enter the Discord client ID: "
set /p mongoUrl="Enter the MongoDB URL: "
set /p devToken="Enter the development token: "
set /p devDiscordClientID="Enter the development Discord client ID: "
set /p devGuildId="Enter the development guild ID: "
set /p devMongoUrl="Enter the development MongoDB URL: "
set /p developerUserIds="Enter developer user IDs (comma-separated): "

(
    echo {
    echo     "token": "!botToken!",
    echo     "discordClientID": "!discordClientID!",
    echo     "mongoUrl": "!mongoUrl!",
    echo     "devToken": "!devToken!",
    echo     "devDiscordClientID": "!devDiscordClientID!",
    echo     "devGuildId": "!devGuildId!",
    echo     "devMongoUrl": "!devMongoUrl!",
    echo     "developerUserIds": ["!developerUserIds!"]
    echo }
) > "!configFile!"

echo Configuration saved to !configFile!

echo Starting the bot...
npm run start

pause
