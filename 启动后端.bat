@echo off
chcp 65001 >nul
echo 正在启动SpringBoot后端...
cd backend
call mvn spring-boot:run
pause

