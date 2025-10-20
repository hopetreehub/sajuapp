/**
 * 귀문둔갑 용어 사전
 *
 * 전문 용어의 한자, 의미, 설명을 제공
 * @author Claude Code
 * @version 1.0.0
 */

export type GlossaryCategory =
  | 'basic'
  | 'star'
  | 'gate'
  | 'god'
  | 'palace'
  | 'stem'
  | 'branch'
  | 'element'
  | 'advanced';

export interface GlossaryTerm {
  id: string;
  term: string; // 한글 용어
  hanja: string; // 한자
  pronunciation?: string; // 발음
  category: GlossaryCategory;
  shortDescription: string; // 한 줄 설명
  detailedDescription: string; // 상세 설명
  relatedTerms?: string[]; // 관련 용어 ID
  examples?: string[]; // 사용 예시
  icon?: string; // 이모지 아이콘
  synonyms?: string[]; // 동의어
}

// 기본 용어
const basicTerms: GlossaryTerm[] = [
  {
    id: 'qimen-dunjia',
    term: '귀문둔갑',
    hanja: '奇門遁甲',
    pronunciation: '기문둔갑',
    category: 'basic',
    shortDescription: '시간과 방위를 이용한 동양 예측술',
    detailedDescription: `귀문둔갑은 중국 고대로부터 전해 내려오는 시공간 점술입니다.

**구성**:
- 기문(奇門): 신비로운 문, 특별한 방법
- 둔갑(遁甲): 숨겨진 갑, 보이지 않는 힘

**활용**:
- 길일 선택 (날짜 잡기)
- 방위 선택 (방향 정하기)
- 의사결정 지원
- 사업 전략 수립

**특징**:
- 시간 중심 (매 2시간마다 변화)
- 방위 중심 (8방위 + 중앙)
- 3차원 분석 (천·인·지)`,
    relatedTerms: ['jiugong', 'jiuxing', 'bamen', 'bashen'],
    examples: [
      '오늘 중요한 회의가 있는데, 귀문둔갑으로 방향을 정했습니다',
      '귀문둔갑에서 생문 방향으로 가세요',
    ],
    icon: '🧭',
  },
  {
    id: 'jiugong',
    term: '구궁',
    hanja: '九宮',
    pronunciation: '구궁',
    category: 'palace',
    shortDescription: '귀문둔갑의 9개 공간 구획',
    detailedDescription: `구궁은 귀문둔갑의 기본 구조로 9개의 공간을 의미합니다.

**배치**:
\`\`\`
4(동남)  9(남)   2(서남)
3(동)    5(중)   7(서)
8(동북)  1(북)   6(서북)
\`\`\`

**특징**:
- 낙서도(洛書圖) 배치
- 각 궁은 고유한 방위와 의미
- 5궁은 중앙으로 특수한 위치

**활용**:
- 방위 결정의 기준
- 길흉 판단의 기본 틀`,
    relatedTerms: ['luoshu', 'bagua'],
    icon: '⚛️',
    synonyms: ['9궁', '구궁도'],
  },
  {
    id: 'tianpan',
    term: '천반',
    hanja: '天盤',
    category: 'basic',
    shortDescription: '하늘의 기운을 나타내는 판, 9성이 배치됨',
    detailedDescription: `천반은 귀문둔갑 삼반(三盤) 중 하나로 하늘의 기운을 나타냅니다.

**구성**: 9성(九星)이 배치
- 천봉성(天蓬星)
- 천영성(天英星)
- 천심성(天心星)
- 등

**의미**:
- 하늘의 뜻
- 운명적 요소
- 자연의 흐름

**활용**:
- 전체적인 운세 파악
- 길흉의 큰 방향 판단`,
    relatedTerms: ['renpan', 'dipan', 'jiuxing'],
    icon: '☁️',
  },
  {
    id: 'renpan',
    term: '인반',
    hanja: '人盤',
    category: 'basic',
    shortDescription: '사람의 행동을 나타내는 판, 8문이 배치됨',
    detailedDescription: `인반은 귀문둔갑 삼반 중 하나로 사람의 행동을 나타냅니다.

**구성**: 8문(八門)이 배치
- 생문(生門)
- 사문(死門)
- 개문(開門)
- 등

**의미**:
- 인간의 행동
- 의지와 선택
- 노력의 방향

**활용**:
- 행동의 결과 예측
- 최적 타이밍 선택`,
    relatedTerms: ['tianpan', 'dipan', 'bamen'],
    icon: '👤',
  },
  {
    id: 'dipan',
    term: '지반',
    hanja: '地盤',
    category: 'basic',
    shortDescription: '땅의 상태를 나타내는 판, 8신이 배치됨',
    detailedDescription: `지반은 귀문둔갑 삼반 중 하나로 땅과 환경의 상태를 나타냅니다.

**구성**: 8신(八神)이 배치
- 직부(直符)
- 백호(白虎)
- 현무(玄武)
- 등

**의미**:
- 환경 조건
- 상황의 특성
- 외부 요인

**활용**:
- 환경 적합성 판단
- 장소 선택 기준`,
    relatedTerms: ['tianpan', 'renpan', 'bashen'],
    icon: '🌍',
  },
  {
    id: 'yindun',
    term: '음둔',
    hanja: '陰遁',
    category: 'basic',
    shortDescription: '하지부터 동지까지의 국, 역행 방식',
    detailedDescription: `음둔은 귀문둔갑에서 하지(夏至) 이후 동지(冬至)까지 사용하는 방식입니다.

**기간**:
- 시작: 하지 다음 날
- 종료: 동지 당일
- 기간: 약 6개월

**특징**:
- 역행 방식 (9→8→7→...)
- 음기 상승기
- 수렴과 정리

**적합한 활동**:
- 내실 다지기
- 정리와 마무리
- 학습과 수양
- 보수적 운영

**주의사항**:
- 확장보다는 안정
- 신중한 의사결정`,
    relatedTerms: ['yangdun', 'dongzhi', 'xiazhi'],
    icon: '🌙',
  },
  {
    id: 'yangdun',
    term: '양둔',
    hanja: '陽遁',
    category: 'basic',
    shortDescription: '동지부터 하지까지의 국, 순행 방식',
    detailedDescription: `양둔은 귀문둔갑에서 동지(冬至) 이후 하지(夏至)까지 사용하는 방식입니다.

**기간**:
- 시작: 동지 다음 날
- 종료: 하지 당일
- 기간: 약 6개월

**특징**:
- 순행 방식 (1→2→3→...)
- 양기 상승기
- 확장과 성장

**적합한 활동**:
- 새로운 시작
- 사업 확장
- 대외 활동
- 공격적 투자

**주의사항**:
- 과도한 확장 경계
- 체력 안배 필요`,
    relatedTerms: ['yindun', 'dongzhi', 'xiazhi'],
    icon: '☀️',
  },
];

// 9성 용어
const starTerms: GlossaryTerm[] = [
  {
    id: 'tianpeng',
    term: '천봉성',
    hanja: '天蓬星',
    category: 'star',
    shortDescription: '도적과 수난을 의미하는 흉성',
    detailedDescription: `천봉성은 9성 중 가장 강한 흉성 중 하나입니다.

**특징**:
- 성질: 물(水)
- 길흉: 대흉성
- 색상: 검은색

**의미**:
- 도둑, 사기
- 수난, 재난
- 음모, 배신

**피해야 할 활동**:
- 중요한 계약
- 큰 투자
- 새로운 시작

**대처법**:
- 이 방향은 피하기
- 불가피한 경우 극도로 신중`,
    relatedTerms: ['jiuxing', 'tianrui'],
    icon: '⚫',
  },
  {
    id: 'tianrui',
    term: '천예성',
    hanja: '天芮星',
    category: 'star',
    shortDescription: '질병과 불길함을 의미하는 흉성',
    detailedDescription: `천예성은 질병과 재난을 상징하는 흉성입니다.

**특징**:
- 성질: 흙(土)
- 길흉: 흉성
- 색상: 황색

**의미**:
- 질병, 병마
- 불길함
- 쇠약, 노쇠

**피해야 할 활동**:
- 건강 관련 결정
- 위험한 여행
- 수술 날짜

**대처법**:
- 건강 검진은 다른 방향
- 치료는 천심성 방향`,
    relatedTerms: ['jiuxing', 'tianpeng', 'tianxin'],
    icon: '🤒',
  },
  {
    id: 'tianxin',
    term: '천심성',
    hanja: '天心星',
    category: 'star',
    shortDescription: '의료와 치유를 의미하는 길성',
    detailedDescription: `천심성은 마음과 치유를 상징하는 길성입니다.

**특징**:
- 성질: 금(金)
- 길흉: 대길성
- 색상: 흰색

**의미**:
- 치유, 회복
- 의료, 건강
- 정신, 마음

**적합한 활동**:
- 병원 방문
- 건강 검진
- 심리 상담
- 명상, 수양

**효과**:
- 빠른 회복
- 정확한 진단
- 마음의 평화`,
    relatedTerms: ['jiuxing', 'tianrui'],
    icon: '💚',
  },
  {
    id: 'tianying',
    term: '천영성',
    hanja: '天英星',
    category: 'star',
    shortDescription: '명예와 영광을 의미하는 길성',
    detailedDescription: `천영성은 명예와 성공을 상징하는 길성입니다.

**특징**:
- 성질: 화(火)
- 길흉: 대길성
- 색상: 빨간색

**의미**:
- 명예, 영광
- 성공, 승진
- 인정, 명성

**적합한 활동**:
- 시험, 면접
- 발표, 프레젠테이션
- 승진 면담
- 공개 행사

**효과**:
- 좋은 평가
- 성공 확률 증가
- 명성 상승`,
    relatedTerms: ['jiuxing', 'tianfu'],
    icon: '🌟',
  },
  {
    id: 'tianfu',
    term: '천보성',
    hanja: '天輔星',
    category: 'star',
    shortDescription: '보좌와 협력을 의미하는 최고 길성',
    detailedDescription: `천보성은 9성 중 가장 길한 별로 알려져 있습니다.

**특징**:
- 성질: 목(木)
- 길흉: 최고 길성
- 색상: 청색

**의미**:
- 보좌, 도움
- 협력, 지원
- 성장, 발전

**적합한 활동**:
- 파트너십 체결
- 중요한 계약
- 사업 시작
- 투자 결정

**효과**:
- 귀인의 도움
- 순조로운 진행
- 성공적 결과`,
    relatedTerms: ['jiuxing', 'tianying'],
    icon: '⭐',
  },
  {
    id: 'tianchong',
    term: '천충성',
    hanja: '天沖星',
    category: 'star',
    shortDescription: '충돌과 돌파를 의미하는 중성',
    detailedDescription: `천충성은 충돌과 돌파력을 상징하는 별입니다.

**특징**:
- 성질: 목(木)
- 길흉: 중성 (상황에 따라 변동)
- 색상: 청록색

**의미**:
- 돌파, 개척
- 충돌, 변화
- 혁신, 개혁

**적합한 활동**:
- 새로운 도전
- 혁신적 프로젝트
- 답답한 상황 타개

**주의사항**:
- 과도한 충돌 피하기
- 신중한 계획 필요`,
    relatedTerms: ['jiuxing'],
    icon: '⚡',
  },
];

// 8문 용어
const gateTerms: GlossaryTerm[] = [
  {
    id: 'shengmen',
    term: '생문',
    hanja: '生門',
    category: 'gate',
    shortDescription: '생성과 시작을 의미하는 최고 길문',
    detailedDescription: `생문은 8문 중 가장 길한 문으로 생성과 탄생을 상징합니다.

**특징**:
- 오행: 토(土)
- 길흉: 최고 길문
- 색상: 초록색 🟢
- 시간: 오전 7-9시

**의미**:
- 생성, 탄생
- 성장, 발전
- 번영, 풍요

**최적 활동**:
- 창업, 개업
- 출산
- 새로운 프로젝트 시작
- 투자, 계약

**효과**:
- 순조로운 시작
- 지속적 성장
- 좋은 결과`,
    relatedTerms: ['bamen', 'kaimen', 'simen'],
    examples: [
      '창업일은 생문 방향으로 정했습니다',
      '오늘 생문이 남쪽에 있으니 남쪽 카페에서 만나요',
    ],
    icon: '🌱',
  },
  {
    id: 'kaimen',
    term: '개문',
    hanja: '開門',
    category: 'gate',
    shortDescription: '열림과 기회를 의미하는 대길문',
    detailedDescription: `개문은 열림과 시작을 상징하는 큰 길문입니다.

**특징**:
- 오행: 금(金)
- 길흉: 대길문
- 색상: 하늘색 🔵
- 시간: 오전 9-11시

**의미**:
- 열림, 개방
- 시작, 개시
- 기회, 확장

**최적 활동**:
- 개업식
- 중요한 만남
- 새로운 기회 포착
- 대외 활동

**효과**:
- 문이 열림
- 기회 증가
- 순조로운 진행`,
    relatedTerms: ['bamen', 'shengmen', 'xiumen'],
    icon: '🚪',
  },
  {
    id: 'xiumen',
    term: '휴문',
    hanja: '休門',
    category: 'gate',
    shortDescription: '휴식과 안정을 의미하는 길문',
    detailedDescription: `휴문은 휴식과 회복을 상징하는 길문입니다.

**특징**:
- 오행: 수(水)
- 길흉: 길문
- 색상: 청록색 🟦
- 시간: 오전 11시-오후 1시

**의미**:
- 휴식, 회복
- 평화, 안정
- 학습, 수양

**최적 활동**:
- 여행, 휴가
- 학습, 공부
- 요양, 휴식
- 평화로운 만남

**효과**:
- 심신 회복
- 평온한 시간
- 좋은 학습 효과`,
    relatedTerms: ['bamen', 'kaimen', 'jingmen'],
    icon: '😌',
  },
  {
    id: 'jingmen',
    term: '경문',
    hanja: '景門',
    category: 'gate',
    shortDescription: '경치와 외관을 의미하는 소길문',
    detailedDescription: `경문은 외관과 명성을 상징하는 소길문입니다.

**특징**:
- 오행: 화(火)
- 길흉: 소길문
- 색상: 노란색 🟡
- 시간: 오후 1-3시

**의미**:
- 경치, 외관
- 화려함, 명성
- 홍보, 마케팅

**최적 활동**:
- 홍보 활동
- 마케팅 행사
- 외교, 교류
- 공개 발표

**주의사항**:
- 실속보다 외관
- 겉치레 주의`,
    relatedTerms: ['bamen', 'xiumen'],
    icon: '✨',
  },
  {
    id: 'shangmen',
    term: '상문',
    hanja: '傷門',
    category: 'gate',
    shortDescription: '상처와 다툼을 의미하는 흉문',
    detailedDescription: `상문은 상처와 갈등을 상징하는 흉문입니다.

**특징**:
- 오행: 목(木)
- 길흉: 흉문
- 색상: 빨간색 🔴
- 시간: 오후 3-5시

**의미**:
- 상처, 손상
- 다툼, 갈등
- 손해, 피해

**피해야 할 활동**:
- 중요한 협상
- 새로운 계약
- 투자 결정
- 위험한 일

**대처법**:
- 이 방향 피하기
- 다툼 조심
- 신중한 언행`,
    relatedTerms: ['bamen', 'dumen', 'simen'],
    icon: '🤕',
  },
  {
    id: 'dumen',
    term: '두문',
    hanja: '杜門',
    category: 'gate',
    shortDescription: '막힘과 폐쇄를 의미하는 대흉문',
    detailedDescription: `두문은 막힘과 정체를 상징하는 대흉문입니다.

**특징**:
- 오행: 목(木)
- 길흉: 대흉문
- 색상: 검은색 ⚫
- 시간: 오후 5-7시

**의미**:
- 막힘, 폐쇄
- 정체, 고립
- 은둔, 차단

**피해야 할 활동**:
- 모든 중요한 일
- 새로운 시도
- 대외 활동
- 확장 계획

**대처법**:
- 절대 피하기
- 내부 정리나 공부만
- 수양 시간으로 활용`,
    relatedTerms: ['bamen', 'shangmen', 'simen'],
    icon: '🚫',
  },
  {
    id: 'simen',
    term: '사문',
    hanja: '死門',
    category: 'gate',
    shortDescription: '죽음과 종결을 의미하는 최악 흉문',
    detailedDescription: `사문은 8문 중 가장 흉한 문으로 종결과 끝을 상징합니다.

**특징**:
- 오행: 토(土)
- 길흉: 최악 흉문
- 색상: 회색 ⚪
- 시간: 오후 7-9시

**의미**:
- 죽음, 종결
- 끝, 파멸
- 재난, 불운

**절대 피해야 할 활동**:
- 모든 중요한 활동
- 새로운 시작
- 계약, 투자
- 건강 관련 결정

**유일한 용도**:
- 종결이 필요한 경우 (이별, 해고 등)
- 그 외는 절대 피하기`,
    relatedTerms: ['bamen', 'shengmen', 'dumen'],
    icon: '💀',
  },
  {
    id: 'jingmen-alarm',
    term: '놀문',
    hanja: '驚門',
    category: 'gate',
    shortDescription: '놀람과 변화를 의미하는 소흉문',
    detailedDescription: `놀문은 놀람과 급변을 상징하는 소흉문입니다.

**특징**:
- 오행: 금(金)
- 길흉: 소흉문
- 색상: 주황색 🟠
- 시간: 오후 9-11시

**의미**:
- 놀람, 충격
- 변화, 변동
- 불안, 긴장

**주의 활동**:
- 변동성 큰 투자
- 중요한 발표
- 예상 외 상황 대비

**활용 가능**:
- 변화가 필요한 경우
- 현상 타파
- 신선한 자극`,
    relatedTerms: ['bamen'],
    icon: '😱',
  },
];

// 8신 용어
const godTerms: GlossaryTerm[] = [
  {
    id: 'zhifu',
    term: '직부',
    hanja: '直符',
    category: 'god',
    shortDescription: '정직과 권위를 의미하는 최고 길신',
    detailedDescription: `직부는 8신 중 가장 길한 신으로 정직과 권위를 상징합니다.

**특징**:
- 성질: 양(陽)
- 길흉: 최고 길신
- 상징: 천자, 권력

**의미**:
- 정직, 정의
- 권위, 위엄
- 공식성, 합법성

**최적 활동**:
- 공식적 행사
- 관공서 업무
- 법적 절차
- 권위 있는 만남

**효과**:
- 공정한 대우
- 권위 인정
- 순조로운 진행`,
    relatedTerms: ['bashen', 'xuanwu'],
    icon: '👑',
  },
  {
    id: 'taishe',
    term: '등사',
    hanja: '螣蛇',
    category: 'god',
    shortDescription: '뱀처럼 유연한 변통을 의미하는 신',
    detailedDescription: `등사는 뱀과 같은 유연함과 변통을 상징합니다.

**특징**:
- 성질: 음(陰)
- 길흉: 소길신
- 상징: 뱀, 변화

**의미**:
- 유연함, 변통
- 적응, 융통
- 교묘함

**적합한 활동**:
- 협상, 외교
- 유연한 대처
- 상황 적응

**주의사항**:
- 과도한 변통 주의
- 원칙 지키기`,
    relatedTerms: ['bashen', 'zhifu'],
    icon: '🐍',
  },
  {
    id: 'taiyin',
    term: '태음',
    hanja: '太陰',
    category: 'god',
    shortDescription: '달처럼 은밀함을 의미하는 길신',
    detailedDescription: `태음은 달과 같은 은밀함과 음성을 상징합니다.

**특징**:
- 성질: 음(陰)
- 길흉: 길신
- 상징: 달, 여성

**의미**:
- 은밀함, 비밀
- 음성, 내부
- 여성성, 부드러움

**적합한 활동**:
- 비밀 회의
- 내부 계획
- 사적인 만남
- 조용한 활동

**효과**:
- 비밀 유지
- 안전한 진행
- 조용한 성공`,
    relatedTerms: ['bashen', 'liuhe'],
    icon: '🌙',
  },
  {
    id: 'liuhe',
    term: '육합',
    hanja: '六合',
    category: 'god',
    shortDescription: '조화와 결합을 의미하는 대길신',
    detailedDescription: `육합은 조화와 합의를 상징하는 대길신입니다.

**특징**:
- 성질: 양(陽)
- 길흉: 대길신
- 상징: 결합, 화합

**의미**:
- 조화, 합의
- 결합, 연합
- 협력, 파트너십

**최적 활동**:
- 파트너십 체결
- 결혼, 약혼
- 협업 시작
- 합의 도출

**효과**:
- 좋은 관계
- 원만한 합의
- 성공적 협력`,
    relatedTerms: ['bashen', 'taiyin', 'baihu'],
    icon: '🤝',
  },
  {
    id: 'baihu',
    term: '백호',
    hanja: '白虎',
    category: 'god',
    shortDescription: '흰 호랑이, 공격과 재해를 의미하는 흉신',
    detailedDescription: `백호는 흰 호랑이로 폭력과 재해를 상징하는 흉신입니다.

**특징**:
- 성질: 양(陽)
- 길흉: 대흉신
- 상징: 호랑이, 폭력

**의미**:
- 폭력, 공격
- 재해, 사고
- 피해, 손상

**피해야 할 활동**:
- 위험한 활동
- 중요한 여행
- 큰 투자
- 법적 분쟁

**대처법**:
- 이 방향 피하기
- 안전 최우선
- 보수적 행동`,
    relatedTerms: ['bashen', 'xuanwu', 'liuhe'],
    icon: '🐯',
  },
  {
    id: 'xuanwu',
    term: '현무',
    hanja: '玄武',
    category: 'god',
    shortDescription: '거북뱀, 도둑과 사기를 의미하는 최악 흉신',
    detailedDescription: `현무는 거북과 뱀이 합쳐진 형상으로 사기를 상징하는 최악의 흉신입니다.

**특징**:
- 성질: 음(陰)
- 길흉: 최악 흉신
- 상징: 도둑, 배신

**의미**:
- 사기, 기만
- 도둑, 절도
- 배신, 배반

**절대 피해야 할 활동**:
- 모든 중요한 거래
- 계약 체결
- 투자 결정
- 신뢰 관계 구축

**대처법**:
- 절대 피하기
- 의심하고 확인
- 계약서 꼼꼼히`,
    relatedTerms: ['bashen', 'zhifu', 'baihu'],
    icon: '🐢🐍',
  },
  {
    id: 'gouchen',
    term: '구진',
    hanja: '勾陳',
    category: 'god',
    shortDescription: '얽힘과 지연을 의미하는 흉신',
    detailedDescription: `구진은 얽힘과 복잡함을 상징하는 흉신입니다.

**특징**:
- 성질: 양(陽)
- 길흉: 흉신
- 상징: 얽힘, 복잡

**의미**:
- 얽힘, 지연
- 복잡함, 난해
- 막힘, 정체

**주의 활동**:
- 복잡한 거래
- 시간 중요한 일
- 빠른 결정 필요 시

**대처법**:
- 여유 시간 확보
- 단순화 노력
- 명확한 계획`,
    relatedTerms: ['bashen', 'zhuque'],
    icon: '🔗',
  },
  {
    id: 'zhuque',
    term: '주작',
    hanja: '朱雀',
    category: 'god',
    shortDescription: '붉은 새, 말다툼과 소송을 의미하는 흉신',
    detailedDescription: `주작은 붉은 새로 언쟁과 소송을 상징하는 흉신입니다.

**특징**:
- 성질: 양(陽)
- 길흉: 흉신
- 상징: 새, 언쟁

**의미**:
- 말다툼, 언쟁
- 소송, 분쟁
- 구설수, 비방

**피해야 할 활동**:
- 중요한 협상
- 법적 절차
- 민감한 대화
- 공개 발언

**대처법**:
- 신중한 언행
- 법적 자문
- 증거 확보`,
    relatedTerms: ['bashen', 'gouchen'],
    icon: '🦅',
  },
];

// 오행 용어
const elementTerms: GlossaryTerm[] = [
  {
    id: 'wuxing',
    term: '오행',
    hanja: '五行',
    category: 'element',
    shortDescription: '우주의 5가지 기본 원소',
    detailedDescription: `오행은 동양 철학의 근간을 이루는 5가지 원소입니다.

**구성**:
1. 목(木) - 나무
2. 화(火) - 불
3. 토(土) - 흙
4. 금(金) - 쇠
5. 수(水) - 물

**상생 관계**:
- 목생화(木生火): 나무가 불을 낳음
- 화생토(火生土): 불이 흙을 낳음
- 토생금(土生金): 흙이 쇠를 낳음
- 금생수(金生水): 쇠가 물을 낳음
- 수생목(水生木): 물이 나무를 낳음

**상극 관계**:
- 목극토(木克土): 나무가 흙을 이김
- 토극수(土克水): 흙이 물을 이김
- 수극화(水克火): 물이 불을 이김
- 화극금(火克金): 불이 쇠를 이김
- 금극목(金克木): 쇠가 나무를 이김`,
    relatedTerms: ['mu', 'huo', 'tu', 'jin', 'shui'],
    icon: '🌈',
  },
  {
    id: 'mu',
    term: '목',
    hanja: '木',
    category: 'element',
    shortDescription: '나무 기운, 성장과 발전',
    detailedDescription: `목(木)은 오행 중 나무를 의미합니다.

**특징**:
- 방위: 동쪽
- 계절: 봄
- 색상: 청색, 녹색
- 성격: 성장, 발전

**의미**:
- 생명력, 성장
- 확장, 발전
- 유연함, 적응

**활용**:
- 새로운 시작
- 성장 기대
- 창의적 활동`,
    relatedTerms: ['wuxing', 'huo', 'tu'],
    icon: '🌳',
  },
  {
    id: 'huo',
    term: '화',
    hanja: '火',
    category: 'element',
    shortDescription: '불 기운, 열정과 명예',
    detailedDescription: `화(火)는 오행 중 불을 의미합니다.

**특징**:
- 방위: 남쪽
- 계절: 여름
- 색상: 빨간색
- 성격: 열정, 명예

**의미**:
- 열정, 적극성
- 명예, 명성
- 화려함, 밝음

**활용**:
- 공개 행사
- 명예로운 일
- 열정적 활동`,
    relatedTerms: ['wuxing', 'mu', 'tu'],
    icon: '🔥',
  },
  {
    id: 'tu',
    term: '토',
    hanja: '土',
    category: 'element',
    shortDescription: '흙 기운, 안정과 신뢰',
    detailedDescription: `토(土)는 오행 중 흙을 의미합니다.

**특징**:
- 방위: 중앙
- 계절: 환절기
- 색상: 황색
- 성격: 안정, 신뢰

**의미**:
- 안정, 중심
- 신뢰, 믿음
- 포용, 수용

**활용**:
- 중재, 조정
- 안정적 활동
- 신뢰 구축`,
    relatedTerms: ['wuxing', 'huo', 'jin'],
    icon: '🏔️',
  },
  {
    id: 'jin',
    term: '금',
    hanja: '金',
    category: 'element',
    shortDescription: '쇠 기운, 정의와 결단',
    detailedDescription: `금(金)은 오행 중 쇠를 의미합니다.

**특징**:
- 방위: 서쪽
- 계절: 가을
- 색상: 흰색
- 성격: 정의, 결단

**의미**:
- 정의, 공정
- 결단, 강함
- 수확, 결실

**활용**:
- 공정한 판단
- 결단력 발휘
- 정리 정돈`,
    relatedTerms: ['wuxing', 'tu', 'shui'],
    icon: '⚙️',
  },
  {
    id: 'shui',
    term: '수',
    hanja: '水',
    category: 'element',
    shortDescription: '물 기운, 지혜와 유동성',
    detailedDescription: `수(水)는 오행 중 물을 의미합니다.

**특징**:
- 방위: 북쪽
- 계절: 겨울
- 색상: 검은색, 청색
- 성격: 지혜, 유동

**의미**:
- 지혜, 학문
- 유동성, 변화
- 저장, 축적

**활용**:
- 학습, 연구
- 유연한 대처
- 재정 관리`,
    relatedTerms: ['wuxing', 'jin', 'mu'],
    icon: '💧',
  },
];

// 고급 용어
const advancedTerms: GlossaryTerm[] = [
  {
    id: 'kongwang',
    term: '공망',
    hanja: '空亡',
    category: 'advanced',
    shortDescription: '빈 망, 기운이 없는 상태',
    detailedDescription: `공망은 기운이 비어 있는 상태를 의미합니다.

**특징**:
- 에너지 부재
- 무효화
- 실속 없음

**의미**:
- 헛수고
- 실속 없음
- 무의미한 결과

**대처법**:
- 공망 시기 피하기
- 중요한 일 미루기
- 내부 정리 시간`,
    relatedTerms: [],
    icon: '⭕',
  },
  {
    id: 'fuyin',
    term: '복음',
    hanja: '伏吟',
    category: 'advanced',
    shortDescription: '같은 기운이 겹쳐 정체됨',
    detailedDescription: `복음은 같은 기운이 중복되어 정체된 상태입니다.

**특징**:
- 정체, 막힘
- 답답함
- 변화 없음

**의미**:
- 현상 유지
- 발전 없음
- 지루함

**대처법**:
- 새로운 시도 미루기
- 기다리기
- 준비 기간`,
    relatedTerms: ['fanyin'],
    icon: '🔄',
  },
  {
    id: 'fanyin',
    term: '반음',
    hanja: '反吟',
    category: 'advanced',
    shortDescription: '반대 기운이 충돌함',
    detailedDescription: `반음은 반대 기운이 충돌하는 상태입니다.

**특징**:
- 충돌, 갈등
- 변화, 동요
- 불안정

**의미**:
- 갈등, 대립
- 급변화
- 혼란

**대처법**:
- 신중한 판단
- 안정 추구
- 갈등 회피`,
    relatedTerms: ['fuyin'],
    icon: '⚡',
  },
];

// 전체 용어 목록
export const allGlossaryTerms: GlossaryTerm[] = [
  ...basicTerms,
  ...starTerms,
  ...gateTerms,
  ...godTerms,
  ...elementTerms,
  ...advancedTerms,
];

// 카테고리별 용어 가져오기
export function getTermsByCategory(category: GlossaryCategory): GlossaryTerm[] {
  return allGlossaryTerms.filter((term) => term.category === category);
}

// 용어 검색 (한글, 한자, 설명 검색)
export function searchTerms(query: string): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase();
  return allGlossaryTerms.filter(
    (term) =>
      term.term.toLowerCase().includes(lowerQuery) ||
      term.hanja.toLowerCase().includes(lowerQuery) ||
      term.shortDescription.toLowerCase().includes(lowerQuery) ||
      term.detailedDescription.toLowerCase().includes(lowerQuery) ||
      term.synonyms?.some((syn) => syn.toLowerCase().includes(lowerQuery))
  );
}

// ID로 용어 찾기
export function getTermById(id: string): GlossaryTerm | undefined {
  return allGlossaryTerms.find((term) => term.id === id);
}

// 관련 용어 가져오기
export function getRelatedTerms(termId: string): GlossaryTerm[] {
  const term = getTermById(termId);
  if (!term || !term.relatedTerms) return [];

  return term.relatedTerms
    .map((id) => getTermById(id))
    .filter((t): t is GlossaryTerm => t !== undefined);
}

// 카테고리 정보
export const categoryInfo: Record<
  GlossaryCategory,
  { name: string; icon: string; description: string }
> = {
  basic: {
    name: '기본 개념',
    icon: '📚',
    description: '귀문둔갑의 핵심 기본 개념',
  },
  star: {
    name: '9성',
    icon: '⭐',
    description: '천반을 구성하는 9개의 별',
  },
  gate: {
    name: '8문',
    icon: '🚪',
    description: '인반을 구성하는 8개의 문',
  },
  god: {
    name: '8신',
    icon: '👼',
    description: '지반을 구성하는 8개의 신',
  },
  palace: {
    name: '궁',
    icon: '🏛️',
    description: '9개의 공간 구획',
  },
  stem: {
    name: '천간',
    icon: '☁️',
    description: '10개의 하늘 기운',
  },
  branch: {
    name: '지지',
    icon: '🌍',
    description: '12개의 땅 기운',
  },
  element: {
    name: '오행',
    icon: '🌈',
    description: '5가지 기본 원소',
  },
  advanced: {
    name: '고급 개념',
    icon: '🎓',
    description: '심화 학습 용어',
  },
};
