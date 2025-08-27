@echo off
echo SajuApp 포트 방화벽 규칙 제거 중...

echo 모든 SajuApp 방화벽 규칙 삭제...
netsh advfirewall firewall delete rule name="SajuApp Frontend"
netsh advfirewall firewall delete rule name="SajuApp API Gateway"
netsh advfirewall firewall delete rule name="SajuApp Calendar Service"
netsh advfirewall firewall delete rule name="SajuApp Auth Service"
netsh advfirewall firewall delete rule name="SajuApp Diary Service"
netsh advfirewall firewall delete rule name="SajuApp Database"
netsh advfirewall firewall delete rule name="SajuApp Redis"

echo.
echo 모든 SajuApp 포트가 닫혔습니다!
echo.

pause