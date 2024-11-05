@echo off
echo ================================
echo      Installing Dependencies     
echo ================================
cd ..
if exist yarn.lock (
    echo Using Yarn to install packages...
    yarn install
) else (
    echo Using NPM to install packages...
    npm install
)
echo ================================
echo          Installation Done!      
echo ================================

echo Counting down to exit...
for /L %%i in (5,-1,1) do (
    echo %%i...
    timeout /t 1 >nul
)
echo 0... Exiting now.
exit