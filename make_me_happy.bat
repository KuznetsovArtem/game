@echo off
rem set git_path=C:\Program Files (x86)\Git\cmd
rem set node_path=C:\Program Files (x86)\nodejs
rem set bower_path=C:\Program Files (x86)\nodejs
echo Setting path
rem SET PATH=%git_path%;%node_path%;%PATH%
rem echo %PATH%

echo git
rem git.exe pull origin

echo node
npm install
bower install

echo server
node server.js