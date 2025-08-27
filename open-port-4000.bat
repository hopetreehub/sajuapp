@echo off
echo SajuApp 포트 4000 방화벽 규칙 추가 중...

echo 포트 4000 열기...
netsh advfirewall firewall add rule name="SajuApp Port 4000" dir=in action=allow protocol=TCP localport=4000

echo.
echo 포트 4000이 성공적으로 열렸습니다!
echo.
echo 현재 포트 4000 방화벽 규칙 확인:
netsh advfirewall firewall show rule name="SajuApp Port 4000"

pause