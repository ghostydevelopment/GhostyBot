@echo off
:menu
echo Choose an option:
echo 1. Install
echo 2. Fill out credentials
echo 3. All
set /p option="Enter your choice (1-3): "

if "%option%"=="1" (
    echo Installing...
    cd ..
    npm install
) else if "%option%"=="2" (
    echo Filling out credentials...
    
    set /p token="Enter your token: "
    set /p discordClientID="Enter your Discord Client ID: "
    set /p mongoUrl="Enter your MongoDB URL: "
    set /p devToken="Enter your development token: "
    set /p devDiscordClientID="Enter your development Discord Client ID: "
    set /p devGuildId="Enter your development Guild ID: "
    set /p devMongoUrl="Enter your development MongoDB URL: "
    
    echo Creating example.example.json...
    (
        echo {
        echo     "token": "%token%",
        echo     "discordClientID": "%discordClientID%",
        echo     "mongoUrl": "%mongoUrl%",
        echo     "devToken": "%devToken%",
        echo     "devDiscordClientID": "%devDiscordClientID%",
        echo     "devGuildId": "%devGuildId%",
        echo     "devMongoUrl": "%devMongoUrl%",
        echo     "developerUserIds": [""] 
        echo }
    ) > ..\data\example.example.json

) else if "%option%"=="3" (
    echo Installing and filling out credentials...
    cd ..
    npm install
    
    set /p token="Enter your token: "
    set /p discordClientID="Enter your Discord Client ID: "
    set /p mongoUrl="Enter your MongoDB URL: "
    set /p devToken="Enter your development token: "
    set /p devDiscordClientID="Enter your development Discord Client ID: "
    set /p devGuildId="Enter your development Guild ID: "
    set /p devMongoUrl="Enter your development MongoDB URL: "
    
    echo Creating example.example.json...
    (
        echo {
        echo     "token": "%token%",
        echo     "discordClientID": "%discordClientID%",
        echo     "mongoUrl": "%mongoUrl%",
        echo     "devToken": "%devToken%",
        echo     "devDiscordClientID": "%devDiscordClientID%",
        echo     "devGuildId": "%devGuildId%",
        echo     "devMongoUrl": "%devMongoUrl%",
        echo     "developerUserIds": [""] 
        echo }
    ) > ..\data\example.example.json

) else (
    echo Invalid option. Please try again.
    goto menu
)
echo Done.
pause
