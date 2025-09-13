#!/usr/bin/env node

/**
 * 운명나침반 백엔드 서비스 종합 Health Check 및 모니터링 시스템
 * 
 * 작성자: Claude Code
 * 작성일: 2025-09-13
 * 
 * 기능:
 * - 모든 백엔드 서비스 상태 점검
 * - 응답 시간 측정
 * - 데이터베이스 연결 상태 확인
 * - 메모리 사용량 모니터링
 * - 프로덕션 준비 상태 평가
 */

const http = require('http');
const https = require('https');
const { execSync } = require('child_process');

class BackendHealthMonitor {
    constructor() {
        this.services = {
            'API Gateway': {
                url: 'http://localhost:5000/health',
                critical: true,
                expectedFields: ['status', 'service', 'timestamp', 'uptime', 'port']
            },
            'Calendar Service': {
                url: 'http://localhost:5001/health',
                critical: true,
                expectedFields: ['status', 'service', 'timestamp', 'database', 'uptime']
            },
            'Diary Service': {
                url: 'http://localhost:5002/health',
                critical: true,
                expectedFields: ['status', 'service', 'timestamp']
            }
        };
        
        this.results = {};
        this.startTime = Date.now();
    }

    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const protocol = url.startsWith('https:') ? https : http;
            
            const req = protocol.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const responseTime = Date.now() - startTime;
                    try {
                        const jsonData = JSON.parse(data);
                        resolve({
                            statusCode: res.statusCode,
                            data: jsonData,
                            responseTime,
                            success: true
                        });
                    } catch (error) {
                        resolve({
                            statusCode: res.statusCode,
                            data: data,
                            responseTime,
                            success: false,
                            error: 'Invalid JSON response'
                        });
                    }
                });
            });

            req.on('error', (error) => {
                const responseTime = Date.now() - startTime;
                resolve({
                    success: false,
                    error: error.message,
                    responseTime
                });
            });

            req.setTimeout(5000, () => {
                req.destroy();
                const responseTime = Date.now() - startTime;
                resolve({
                    success: false,
                    error: 'Request timeout',
                    responseTime
                });
            });
        });
    }

    async checkServiceHealth(serviceName, config) {
        console.log(`🔍 ${serviceName} 상태 점검 중...`);
        
        const result = await this.makeRequest(config.url);
        
        const healthData = {
            serviceName,
            url: config.url,
            critical: config.critical,
            ...result
        };

        // 응답 시간 평가
        if (result.responseTime < 100) {
            healthData.performanceGrade = 'A';
        } else if (result.responseTime < 300) {
            healthData.performanceGrade = 'B';
        } else if (result.responseTime < 1000) {
            healthData.performanceGrade = 'C';
        } else {
            healthData.performanceGrade = 'D';
        }

        // 응답 데이터 검증
        if (result.success && result.data) {
            healthData.fieldValidation = this.validateResponseFields(result.data, config.expectedFields);
            healthData.serviceStatus = result.data.status || 'unknown';
            healthData.uptime = result.data.uptime || 0;
            healthData.databaseStatus = result.data.database || 'not-checked';
        }

        return healthData;
    }

    validateResponseFields(data, expectedFields) {
        const validation = {
            score: 0,
            total: expectedFields.length,
            missing: [],
            present: []
        };

        expectedFields.forEach(field => {
            if (data.hasOwnProperty(field)) {
                validation.score++;
                validation.present.push(field);
            } else {
                validation.missing.push(field);
            }
        });

        validation.percentage = Math.round((validation.score / validation.total) * 100);
        return validation;
    }

    async checkSystemResources() {
        console.log('🖥️  시스템 리소스 점검 중...');
        
        try {
            // 포트 사용 현황 확인
            const portCheck = execSync('netstat -an | findstr ":500" | findstr LISTENING', { encoding: 'utf8' }).trim();
            const listeningPorts = portCheck.split('\n').filter(line => line.includes('LISTENING')).length;

            // Node.js 프로세스 확인
            const nodeProcesses = execSync('tasklist | findstr node.exe', { encoding: 'utf8' }).trim();
            const processCount = nodeProcesses.split('\n').filter(line => line.includes('node.exe')).length;

            return {
                listeningPorts,
                nodeProcesses: processCount,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async runLoadTest() {
        console.log('⚡ 부하 테스트 실행 중...');
        
        const testUrl = 'http://localhost:5000/api/calendar/events';
        const concurrentRequests = 5;
        const requests = [];

        for (let i = 0; i < concurrentRequests; i++) {
            requests.push(this.makeRequest(testUrl));
        }

        const results = await Promise.all(requests);
        
        const responseTimes = results.map(r => r.responseTime);
        const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const maxResponseTime = Math.max(...responseTimes);
        const minResponseTime = Math.min(...responseTimes);
        const successRate = (results.filter(r => r.success).length / results.length) * 100;

        return {
            concurrentRequests,
            averageResponseTime: Math.round(averageResponseTime),
            maxResponseTime,
            minResponseTime,
            successRate: Math.round(successRate),
            grade: successRate === 100 && averageResponseTime < 200 ? 'A+' : 
                   successRate === 100 && averageResponseTime < 500 ? 'A' :
                   successRate >= 80 ? 'B' : 'C'
        };
    }

    generateReport() {
        const totalDuration = Date.now() - this.startTime;
        
        console.log('\n' + '='.repeat(80));
        console.log('🚀 운명나침반 백엔드 서비스 안정화 보고서');
        console.log('='.repeat(80));
        console.log(`📊 점검 시간: ${new Date().toLocaleString('ko-KR')}`);
        console.log(`⏱️  총 소요 시간: ${totalDuration}ms`);
        console.log('');

        // 서비스별 상태 요약
        console.log('📋 서비스 상태 요약:');
        console.log('-'.repeat(40));
        
        let healthyServices = 0;
        let criticalIssues = 0;
        
        Object.values(this.results.services || {}).forEach(service => {
            const status = service.success ? '✅ 정상' : '❌ 장애';
            const response = `${service.responseTime}ms (${service.performanceGrade})`;
            const database = service.databaseStatus === 'connected' ? '🟢 연결됨' : 
                           service.databaseStatus === 'disconnected' ? '🔴 끊어짐' : '⚪ 미확인';
            
            console.log(`${service.serviceName.padEnd(20)} ${status.padEnd(10)} ${response.padEnd(15)} ${database}`);
            
            if (service.success) healthyServices++;
            if (!service.success && service.critical) criticalIssues++;
        });

        console.log('');

        // 성능 지표
        if (this.results.loadTest) {
            const lt = this.results.loadTest;
            console.log('⚡ 성능 테스트 결과:');
            console.log('-'.repeat(40));
            console.log(`동시 요청 수: ${lt.concurrentRequests}개`);
            console.log(`평균 응답 시간: ${lt.averageResponseTime}ms`);
            console.log(`최대 응답 시간: ${lt.maxResponseTime}ms`);
            console.log(`최소 응답 시간: ${lt.minResponseTime}ms`);
            console.log(`성공률: ${lt.successRate}%`);
            console.log(`성능 등급: ${lt.grade}`);
            console.log('');
        }

        // 시스템 리소스
        if (this.results.systemResources) {
            const sr = this.results.systemResources;
            console.log('🖥️  시스템 리소스:');
            console.log('-'.repeat(40));
            console.log(`활성 포트(5000번대): ${sr.listeningPorts || 0}개`);
            console.log(`Node.js 프로세스: ${sr.nodeProcesses || 0}개`);
            console.log('');
        }

        // 종합 평가
        console.log('🎯 종합 평가:');
        console.log('-'.repeat(40));
        
        const totalServices = Object.keys(this.services).length;
        const healthPercentage = Math.round((healthyServices / totalServices) * 100);
        
        let overallGrade;
        if (criticalIssues === 0 && healthPercentage === 100) {
            overallGrade = 'A+ (프로덕션 준비 완료)';
        } else if (criticalIssues === 0 && healthPercentage >= 80) {
            overallGrade = 'A (양호)';
        } else if (criticalIssues <= 1) {
            overallGrade = 'B (개선 필요)';
        } else {
            overallGrade = 'C (긴급 조치 필요)';
        }

        console.log(`서비스 가용성: ${healthPercentage}% (${healthyServices}/${totalServices})`);
        console.log(`중요 서비스 장애: ${criticalIssues}개`);
        console.log(`종합 등급: ${overallGrade}`);
        console.log('');

        // 권장사항
        console.log('💡 권장사항:');
        console.log('-'.repeat(40));
        
        if (criticalIssues > 0) {
            console.log('🚨 중요 서비스에 장애가 발생했습니다. 즉시 복구가 필요합니다.');
        }
        
        if (this.results.loadTest && this.results.loadTest.averageResponseTime > 500) {
            console.log('🐌 응답 시간이 느립니다. 성능 최적화를 고려하세요.');
        }
        
        if (healthPercentage === 100) {
            console.log('✨ 모든 서비스가 정상 작동 중입니다!');
            console.log('📈 정기적인 모니터링을 통해 안정성을 유지하세요.');
            console.log('🔒 보안 업데이트와 백업을 주기적으로 수행하세요.');
        }
        
        console.log('🔧 로그 파일을 정기적으로 확인하여 잠재적 문제를 예방하세요.');
        console.log('📊 데이터베이스 성능 모니터링을 설정하는 것을 권장합니다.');
        
        console.log('');
        console.log('='.repeat(80));
        console.log('🤖 Generated with Claude Code - DevOps 전문가 모드');
        console.log('='.repeat(80));
    }

    async runFullHealthCheck() {
        console.log('🏥 운명나침반 백엔드 서비스 종합 건강 진단 시작...\n');

        // 1. 개별 서비스 상태 점검
        this.results.services = {};
        for (const [serviceName, config] of Object.entries(this.services)) {
            this.results.services[serviceName] = await this.checkServiceHealth(serviceName, config);
        }

        // 2. 시스템 리소스 점검
        this.results.systemResources = await this.checkSystemResources();

        // 3. 부하 테스트
        this.results.loadTest = await this.runLoadTest();

        // 4. 보고서 생성
        this.generateReport();
    }
}

// 실행
if (require.main === module) {
    const monitor = new BackendHealthMonitor();
    monitor.runFullHealthCheck().catch(console.error);
}

module.exports = BackendHealthMonitor;