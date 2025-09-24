#!/usr/bin/env node

/**
 * 목업 데이터 제거 및 프로덕션 준비 스크립트
 * - 모든 테스트/목업 데이터 제거
 * - 데이터베이스 초기화
 * - 프로덕션 환경 준비
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 데이터베이스 경로
const CALENDAR_DB = path.join(__dirname, '../packages/backend/services/calendar/calendar.db');
const CUSTOMERS_DB = path.join(__dirname, '../packages/backend/services/calendar/customers.db');

console.log('🧹 목업 데이터 정리 시작...\n');

// 1. 백업 생성
function backupDatabase(dbPath) {
  const backupPath = dbPath + '.backup-' + new Date().toISOString().replace(/:/g, '-');
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`✅ 백업 생성: ${backupPath}`);
    return true;
  }
  return false;
}

// 2. 목업 데이터 삭제
function cleanMockupData() {
  // Calendar DB 정리
  if (fs.existsSync(CALENDAR_DB)) {
    backupDatabase(CALENDAR_DB);
    const calendarDb = new sqlite3.Database(CALENDAR_DB);

    calendarDb.serialize(() => {
      // 모든 이벤트 삭제
      calendarDb.run("DELETE FROM events", (err) => {
        if (!err) console.log('✅ Calendar: 모든 이벤트 삭제 완료');
      });

      // 모든 태그 삭제
      calendarDb.run("DELETE FROM tags", (err) => {
        if (!err) console.log('✅ Calendar: 모든 태그 삭제 완료');
      });
    });

    calendarDb.close();
  }

  // Customers DB 정리
  if (fs.existsSync(CUSTOMERS_DB)) {
    backupDatabase(CUSTOMERS_DB);
    const customersDb = new sqlite3.Database(CUSTOMERS_DB);

    customersDb.serialize(() => {
      // 목업 고객 삭제 (정치인 등)
      const mockupCustomers = [
        '이재명', '한동훈', '김동연', '김부선', '홍준표', '조국',
        '윤석열', '이낙연', '안철수', '심상정'
      ];

      const placeholders = mockupCustomers.map(() => '?').join(',');
      customersDb.run(
        `DELETE FROM customers WHERE name IN (${placeholders})`,
        mockupCustomers,
        (err) => {
          if (!err) console.log('✅ Customers: 목업 고객 데이터 삭제 완료');
        }
      );

      // 모든 고객 삭제 (완전 초기화를 원할 경우)
      // customersDb.run("DELETE FROM customers", (err) => {
      //   if (!err) console.log('✅ Customers: 모든 고객 삭제 완료');
      // });
    });

    customersDb.close();
  }
}

// 3. 프로덕션 초기 데이터 설정
function setupProductionData() {
  console.log('\n📦 프로덕션 초기 데이터 설정...\n');

  const calendarDb = new sqlite3.Database(CALENDAR_DB);

  calendarDb.serialize(() => {
    // 기본 태그 생성
    const defaultTags = [
      { name: '중요', color: '#ef4444' },
      { name: '업무', color: '#3b82f6' },
      { name: '개인', color: '#10b981' },
      { name: '가족', color: '#f59e0b' },
      { name: '건강', color: '#8b5cf6' }
    ];

    const stmt = calendarDb.prepare("INSERT OR IGNORE INTO tags (name, color) VALUES (?, ?)");
    defaultTags.forEach(tag => {
      stmt.run(tag.name, tag.color);
    });
    stmt.finalize();

    console.log('✅ 기본 태그 생성 완료');
  });

  calendarDb.close();
}

// 4. 로컬 스토리지 데이터 정리 안내
function showLocalStorageCleanup() {
  console.log('\n⚠️  브라우저 로컬 스토리지 정리 필요:\n');
  console.log('1. 브라우저 개발자 도구 열기 (F12)');
  console.log('2. Console 탭에서 다음 명령 실행:');
  console.log('   localStorage.clear()');
  console.log('3. 페이지 새로고침 (F5)\n');
}

// 실행
cleanMockupData();
setupProductionData();
showLocalStorageCleanup();

console.log('🎉 프로덕션 준비 완료!\n');
console.log('다음 단계:');
console.log('1. Railway CLI로 로그인: railway login');
console.log('2. 프로젝트 생성: railway init');
console.log('3. 서비스 배포: railway up');