/**
 * 사주 해석 서비스 메인 서버
 */

const express = require('express');
const cors = require('cors');
const dataLoaderService = require('./data-loader.service');
const interpretationService = require('./interpretation.service');

const app = express();
const PORT = process.env.SAJU_SERVICE_PORT || 4002;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 서비스 초기화
async function initializeServices() {
  try {
    await dataLoaderService.loadAllData();
    console.log('✅ 사주 해석 서비스 초기화 완료');
  } catch (error) {
    console.error('❌ 서비스 초기화 실패:', error);
    process.exit(1);
  }
}

// === API 엔드포인트 ===

/**
 * 헬스체크
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'saju-interpretation',
    timestamp: new Date().toISOString()
  });
});

/**
 * 종합 해석 생성
 * POST /api/interpretation/comprehensive
 */
app.post('/api/interpretation/comprehensive', async (req, res) => {
  try {
    const sajuData = req.body;
    
    if (!sajuData || !sajuData.fourPillars) {
      return res.status(400).json({
        error: '사주 데이터가 필요합니다.'
      });
    }

    const interpretation = await interpretationService.generateComprehensiveInterpretation(sajuData);
    
    res.json({
      success: true,
      data: interpretation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('종합 해석 생성 오류:', error);
    res.status(500).json({
      error: '해석 생성 중 오류가 발생했습니다.',
      message: error.message
    });
  }
});

/**
 * 기본 분석 가져오기
 * POST /api/interpretation/basic
 */
app.post('/api/interpretation/basic', async (req, res) => {
  try {
    const sajuData = req.body;
    const basicAnalysis = interpretationService.generateBasicAnalysis(sajuData);
    
    res.json({
      success: true,
      data: basicAnalysis
    });
  } catch (error) {
    console.error('기본 분석 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 조후 분석 가져오기
 * POST /api/interpretation/johoo
 */
app.post('/api/interpretation/johoo', async (req, res) => {
  try {
    const sajuData = req.body;
    const johooAnalysis = interpretationService.generateJohooAnalysis(sajuData);
    
    res.json({
      success: true,
      data: johooAnalysis
    });
  } catch (error) {
    console.error('조후 분석 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 신살 분석 가져오기
 * POST /api/interpretation/spiritual
 */
app.post('/api/interpretation/spiritual', async (req, res) => {
  try {
    const sajuData = req.body;
    const spiritualAnalysis = interpretationService.generateSpiritualAnalysis(sajuData);
    
    res.json({
      success: true,
      data: spiritualAnalysis
    });
  } catch (error) {
    console.error('신살 분석 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 철학적 통찰 가져오기
 * POST /api/interpretation/philosophy
 */
app.post('/api/interpretation/philosophy', async (req, res) => {
  try {
    const sajuData = req.body;
    const philosophy = interpretationService.generatePhilosophicalInsight(sajuData);
    
    res.json({
      success: true,
      data: philosophy
    });
  } catch (error) {
    console.error('철학적 통찰 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 성격 분석 가져오기
 * POST /api/interpretation/personality
 */
app.post('/api/interpretation/personality', async (req, res) => {
  try {
    const sajuData = req.body;
    const personality = interpretationService.generatePersonalityAnalysis(sajuData);
    
    res.json({
      success: true,
      data: personality
    });
  } catch (error) {
    console.error('성격 분석 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 운세 분석 가져오기
 * POST /api/interpretation/fortune
 */
app.post('/api/interpretation/fortune', async (req, res) => {
  try {
    const sajuData = req.body;
    const fortune = interpretationService.generateFortuneAnalysis(sajuData);
    
    res.json({
      success: true,
      data: fortune
    });
  } catch (error) {
    console.error('운세 분석 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 직업 지도 가져오기
 * POST /api/interpretation/career
 */
app.post('/api/interpretation/career', async (req, res) => {
  try {
    const sajuData = req.body;
    const career = interpretationService.generateCareerGuidance(sajuData);
    
    res.json({
      success: true,
      data: career
    });
  } catch (error) {
    console.error('직업 지도 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 관계 분석 가져오기
 * POST /api/interpretation/relationship
 */
app.post('/api/interpretation/relationship', async (req, res) => {
  try {
    const sajuData = req.body;
    const relationship = interpretationService.generateRelationshipAnalysis(sajuData);
    
    res.json({
      success: true,
      data: relationship
    });
  } catch (error) {
    console.error('관계 분석 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 건강 지도 가져오기
 * POST /api/interpretation/health
 */
app.post('/api/interpretation/health', async (req, res) => {
  try {
    const sajuData = req.body;
    const health = interpretationService.generateHealthGuidance(sajuData);
    
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('건강 지도 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 데이터 재로드 (관리자용)
 * POST /api/admin/reload
 */
app.post('/api/admin/reload', async (req, res) => {
  try {
    await dataLoaderService.reloadData();
    res.json({
      success: true,
      message: '데이터 재로드 완료'
    });
  } catch (error) {
    console.error('데이터 재로드 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 특정 이론 데이터 가져오기
 * GET /api/data/:category/:item
 */
app.get('/api/data/:category/:item?', async (req, res) => {
  try {
    const { category, item } = req.params;
    let data = null;

    switch(category) {
      case 'yongshin':
        data = dataLoaderService.getYongshinTheory();
        break;
      case 'gyeokguk':
        data = dataLoaderService.getGyeokgukTheory();
        break;
      case 'johoo':
        data = dataLoaderService.getJohooTheory();
        break;
      case 'spiritual':
        data = dataLoaderService.getSpiritualInfluences();
        break;
      case 'philosophy':
        data = dataLoaderService.getPhilosophicalPrinciples();
        break;
      case 'sigyeol':
        data = dataLoaderService.getSigyeolFormulas();
        break;
      case 'personality':
        data = dataLoaderService.getPersonalityRules();
        break;
      case 'fortune':
        data = dataLoaderService.getFortuneRules();
        break;
      case 'career':
        data = dataLoaderService.getCareerRules();
        break;
      case 'health':
        data = dataLoaderService.getHealthRules();
        break;
      case 'relationship':
        data = dataLoaderService.getRelationshipRules();
        break;
      case 'examples':
        data = dataLoaderService.getExamples(item);
        break;
      default:
        return res.status(404).json({ error: '카테고리를 찾을 수 없습니다.' });
    }

    if (!data) {
      return res.status(404).json({ error: '데이터를 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      category,
      item,
      data
    });
  } catch (error) {
    console.error('데이터 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    error: '요청한 엔드포인트를 찾을 수 없습니다.',
    path: req.path
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('서버 오류:', err);
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다.',
    message: err.message
  });
});

// 서버 시작
async function startServer() {
  await initializeServices();
  
  app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════════╗
    ║  사주 해석 서비스가 시작되었습니다!         ║
    ║  포트: ${PORT}                              ║
    ║  URL: http://localhost:${PORT}              ║
    ║  헬스체크: http://localhost:${PORT}/health  ║
    ╚════════════════════════════════════════════╝
    `);
  });
}

// 서버 시작
startServer().catch(error => {
  console.error('서버 시작 실패:', error);
  process.exit(1);
});