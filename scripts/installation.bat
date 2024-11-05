@echo off
echo Installing dependencies...
cd ..
if exist yarn.lock (
    yarn install
) else (
    npm install
)
echo Done.
pause