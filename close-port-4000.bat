@echo off
echo SajuApp 포트 4000 방화벽 규칙 제거 중...

echo 포트 4000 닫기...
netsh advfirewall firewall delete rule name="SajuApp Port 4000"

echo.
echo 포트 4000이 닫혔습니다!
echo.

pause