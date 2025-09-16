// DiaryModal API 연동 완성 - 최종 테스트 스크립트
// 실행: node final-test.js

const axios = require('axios');

const DIARY_BASE_URL = 'http://localhost:5002';
const USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

async function testDiaryAPI() {
    console.log('🧪 DiaryModal API 연동 최종 테스트 시작\n');

    try {
        // 1. 서비스 헬스 체크
        console.log('1️⃣ Diary Service 헬스 체크...');
        const healthResponse = await axios.get(`${DIARY_BASE_URL}/health`);
        console.log('✅ 서비스 상태:', healthResponse.data);

        // 2. 기존 일기 조회 (오늘)
        const today = new Date().toISOString().split('T')[0];
        console.log(`\n2️⃣ 오늘(${today}) 일기 조회...`);

        try {
            const diaryResponse = await axios.get(`${DIARY_BASE_URL}/api/diaries/${today}`, {
                headers: { 'x-user-id': USER_ID }
            });
            console.log('✅ 기존 일기 발견:', {
                id: diaryResponse.data.id,
                content: diaryResponse.data.content.substring(0, 50) + '...',
                mood: diaryResponse.data.mood,
                created_at: diaryResponse.data.created_at
            });
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('📝 오늘 일기가 없음 (새 일기 작성 가능)');
            } else {
                throw error;
            }
        }

        // 3. 일기 목록 조회
        console.log('\n3️⃣ 일기 목록 조회...');
        const diariesResponse = await axios.get(`${DIARY_BASE_URL}/api/diaries`, {
            headers: { 'x-user-id': USER_ID },
            params: { limit: 5 }
        });
        console.log(`✅ 총 ${diariesResponse.data.length}개의 일기 발견`);

        // 4. 프론트엔드 서버 확인
        console.log('\n4️⃣ 프론트엔드 서버 확인...');
        try {
            await axios.get('http://localhost:4001');
            console.log('✅ 프론트엔드 서버 실행 중 (http://localhost:4001)');
        } catch {
            console.log('❌ 프론트엔드 서버 연결 실패');
        }

        console.log('\n🎉 API 연동 테스트 완료!');
        console.log('\n📱 브라우저 테스트 방법:');
        console.log('1. http://localhost:4001 에 접속');
        console.log('2. 캘린더에서 날짜를 클릭하여 일기 모달 열기');
        console.log('3. 일기 작성 후 저장 버튼 클릭');
        console.log('4. 모달이 닫히고 일기가 저장되는지 확인');

    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
        if (error.response) {
            console.error('응답 상태:', error.response.status);
            console.error('응답 데이터:', error.response.data);
        }
    }
}

testDiaryAPI();