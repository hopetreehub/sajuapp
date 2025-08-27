@echo off
echo SajuApp 포트 방화벽 규칙 추가 중...

echo 프론트엔드 포트 4010 열기...
netsh advfirewall firewall add rule name="SajuApp Frontend" dir=in action=allow protocol=TCP localport=4010

echo API Gateway 포트 4012 열기...
netsh advfirewall firewall add rule name="SajuApp API Gateway" dir=in action=allow protocol=TCP localport=4012

echo Calendar Service 포트 4003 열기...
netsh advfirewall firewall add rule name="SajuApp Calendar Service" dir=in action=allow protocol=TCP localport=4003

echo Auth Service 포트 4004 열기...
netsh advfirewall firewall add rule name="SajuApp Auth Service" dir=in action=allow protocol=TCP localport=4004

echo Diary Service 포트 4005 열기...
netsh advfirewall firewall add rule name="SajuApp Diary Service" dir=in action=allow protocol=TCP localport=4005

echo Database 포트 4006 열기...
netsh advfirewall firewall add rule name="SajuApp Database" dir=in action=allow protocol=TCP localport=4006

echo Redis 포트 4007 열기...
netsh advfirewall firewall add rule name="SajuApp Redis" dir=in action=allow protocol=TCP localport=4007

echo.
echo 모든 포트가 성공적으로 열렸습니다!
echo.
echo 현재 열린 포트 확인:
netsh advfirewall firewall show rule name=all | findstr "SajuApp"

pause