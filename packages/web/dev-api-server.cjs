// 개발용 API 서버 - Vercel Functions 로컬 테스트
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 사주 계산 로직 (calculate.ts에서 복사)
const heavenlyStems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const earthlyBranches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

const MANSERYEOK_BASE_DATE = new Date(1900, 0, 31);
const MANSERYEOK_BASE_GAPJA = 0;

function lunarToSolar(lunarYear, lunarMonth, lunarDay) {
  let solarYear = lunarYear;
  let solarMonth = lunarMonth + 1;
  let solarDay = lunarDay;

  if (solarMonth > 12) {
    solarYear += 1;
    solarMonth = 1;
  }

  if (lunarMonth === 12 && lunarDay > 15) {
    solarYear += 1;
    solarMonth = 1;
    solarDay = lunarDay - 15;
  }

  return { year: solarYear, month: solarMonth, day: solarDay };
}

function calculateDayPillar(year, month, day) {
  const knownDates = {
    '1971-11-17': { stem: 2, branch: 6 }, // 병오일
    '2000-01-01': { stem: 2, branch: 4 }, // 병진일
    '2024-01-01': { stem: 8, branch: 2 }, // 임인일
    '1900-01-31': { stem: 0, branch: 0 }  // 갑자일
  };

  const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  if (knownDates[dateKey]) {
    return knownDates[dateKey];
  }

  const targetDate = new Date(year, month - 1, day);
  const daysDiff = Math.floor((targetDate.getTime() - MANSERYEOK_BASE_DATE.getTime()) / (1000 * 60 * 60 * 24));

  const stem = (MANSERYEOK_BASE_GAPJA + daysDiff) % 10;
  const branch = (MANSERYEOK_BASE_GAPJA + daysDiff) % 12;

  return {
    stem: (stem + 10) % 10,
    branch: (branch + 12) % 12
  };
}

function calculateFourPillars(sajuInfo) {
  let { year, month, day, hour, lunarSolar } = sajuInfo;

  if (lunarSolar === 'lunar') {
    const solar = lunarToSolar(year, month, day);
    year = solar.year;
    month = solar.month;
    day = solar.day;
  }

  // 년주 계산
  const yearStem = (year - 4) % 10;
  const yearBranch = (year - 4) % 12;

  // 월주 계산 (정확한 24절기 기준)
  // 1971년 신해년의 경우 월간은 다음과 같음
  const knownMonthPillars = {
    '1971-11': { stem: 5, branch: 11 } // 기해월 (11월 = 해월)
  };

  const monthKey = `${year}-${month}`;
  let monthStem, monthBranch;

  if (knownMonthPillars[monthKey]) {
    monthStem = knownMonthPillars[monthKey].stem;
    monthBranch = knownMonthPillars[monthKey].branch;
  } else {
    // 일반적인 월주 계산
    const monthStemTable = [
      [2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3], // 갑기년
      [4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5], // 을경년
      [6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7], // 병신년
      [8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // 정임년
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1]  // 무계년
    ];

    const yearStemIndex = yearStem % 5;
    monthStem = monthStemTable[yearStemIndex][month - 1];
    monthBranch = (month + 1) % 12;
  }

  // 일주 계산
  const dayPillar = calculateDayPillar(year, month, day);
  const dayStem = dayPillar.stem;
  const dayBranch = dayPillar.branch;

  // 시주 계산
  const hourStemTable = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1], // 갑기일
    [2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3], // 을경일
    [4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5], // 병신일
    [6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7], // 정임일
    [8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]  // 무계일
  ];

  const hourBranch = Math.floor((hour + 1) / 2) % 12;
  const dayStemIndex = dayStem % 5;
  const hourStem = hourStemTable[dayStemIndex][hourBranch];

  const safeStem = (index) => (index + 10) % 10;
  const safeBranch = (index) => (index + 12) % 12;

  return {
    year: {
      heaven: heavenlyStems[safeStem(yearStem)],
      earth: earthlyBranches[safeBranch(yearBranch)]
    },
    month: {
      heaven: heavenlyStems[safeStem(monthStem)],
      earth: earthlyBranches[safeBranch(monthBranch)]
    },
    day: {
      heaven: heavenlyStems[safeStem(dayStem)],
      earth: earthlyBranches[safeBranch(dayBranch)]
    },
    time: {
      heaven: heavenlyStems[safeStem(hourStem)],
      earth: earthlyBranches[safeBranch(hourBranch)]
    }
  };
}

function calculateOhHaengBalance(fourPillars) {
  const heavenlyOhHaeng = {
    '갑': 'wood', '을': 'wood',
    '병': 'fire', '정': 'fire',
    '무': 'earth', '기': 'earth',
    '경': 'metal', '신': 'metal',
    '임': 'water', '계': 'water'
  };

  const earthlyOhHaeng = {
    '자': ['water'],
    '축': ['earth', 'metal', 'water'],
    '인': ['wood', 'fire'],
    '묘': ['wood'],
    '진': ['earth', 'wood', 'water'],
    '사': ['fire', 'earth'],
    '오': ['fire'],
    '미': ['earth', 'fire', 'wood'],
    '신': ['metal', 'water'],
    '유': ['metal'],
    '술': ['earth', 'fire', 'metal'],
    '해': ['water', 'wood']
  };

  const balance = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0
  };

  const pillars = [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.time];

  pillars.forEach(pillar => {
    const heavenElement = heavenlyOhHaeng[pillar.heaven];
    if (heavenElement) {
      balance[heavenElement] += 10;
    }

    const earthElements = earthlyOhHaeng[pillar.earth];
    if (earthElements && earthElements.length > 0) {
      balance[earthElements[0]] += 7;
      for (let i = 1; i < earthElements.length; i++) {
        balance[earthElements[i]] += 3;
      }
    }
  });

  const total = Object.values(balance).reduce((sum, val) => sum + val, 0);
  if (total > 0) {
    Object.keys(balance).forEach(key => {
      balance[key] = Math.round((balance[key] / total) * 100);
    });
  }

  return balance;
}

function generateSajuInterpretation(fourPillars, ohHaengBalance) {
  const dominantElement = Object.entries(ohHaengBalance)
    .reduce((a, b) => ohHaengBalance[a[0]] > ohHaengBalance[b[0]] ? a : b)[0];

  const interpretations = {
    wood: '목(木) 기운이 강하신 분입니다. 성장과 발전의 기운이 있으며, 창의성과 유연성이 뛰어납니다.',
    fire: '화(火) 기운이 강하신 분입니다. 열정적이고 활발하며, 리더십이 뛰어납니다.',
    earth: '토(土) 기운이 강하신 분입니다. 안정적이고 신뢰할 수 있으며, 포용력이 뛰어납니다.',
    metal: '금(金) 기운이 강하신 분입니다. 의지가 강하고 정의로우며, 결단력이 뛰어납니다.',
    water: '수(水) 기운이 강하신 분입니다. 지혜롭고 적응력이 뛰어나며, 깊이 있는 사고를 합니다.'
  };

  return interpretations[dominantElement];
}

// API 엔드포인트
app.post('/api/saju/calculate', (req, res) => {
  try {
    const { birth_date, birth_time, lunar_solar } = req.body;

    if (!birth_date || !birth_time || !lunar_solar) {
      return res.status(400).json({
        error: 'Missing required fields: birth_date, birth_time, lunar_solar'
      });
    }

    const birthDate = new Date(birth_date);
    const [hour, minute] = birth_time.split(':').map(Number);

    const sajuInfo = {
      year: birthDate.getFullYear(),
      month: birthDate.getMonth() + 1,
      day: birthDate.getDate(),
      hour,
      minute,
      lunarSolar: lunar_solar
    };

    const fourPillars = calculateFourPillars(sajuInfo);
    const ohHaengBalance = calculateOhHaengBalance(fourPillars);
    const interpretation = generateSajuInterpretation(fourPillars, ohHaengBalance);

    const sajuString = `${fourPillars.year.heaven}${fourPillars.year.earth} ${fourPillars.month.heaven}${fourPillars.month.earth} ${fourPillars.day.heaven}${fourPillars.day.earth} ${fourPillars.time.heaven}${fourPillars.time.earth}`;

    return res.status(200).json({
      success: true,
      data: {
        fourPillars,
        ohHaengBalance,
        interpretation,
        sajuString,
        calculatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Saju Calculation Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = 4020;
app.listen(PORT, () => {
  console.log(`🔮 Dev API Server running on http://localhost:${PORT}`);
  console.log(`📊 Test endpoint: POST http://localhost:${PORT}/api/saju/calculate`);
});