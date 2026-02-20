@echo off
chcp 65001 >nul
echo 正在启动Vue3前端...
cd frontend
call npm install
call npm run dev
pause

