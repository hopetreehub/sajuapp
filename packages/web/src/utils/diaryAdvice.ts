// 일기장 전용 운세 조언 시스템
// 일간 캘린더 운세와는 다른 성찰/감성 중심의 조언들

interface AdviceCategory {
  reflection: string[] // 성찰 조언
  emotion: string[]     // 감정 조언  
  relationship: string[] // 관계 조언
  growth: string[]      // 성장 조언
  gratitude: string[]   // 감사 조언
}

const DIARY_ADVICE_DATABASE: AdviceCategory = {
  reflection: [
    "오늘 하루 가장 감사했던 순간은 언제였나요?",
    "마음 깊은 곳의 진짜 기분을 솔직하게 적어보세요.",
    "오늘 나에게 가장 소중했던 것은 무엇인가요?",
    "하루를 돌아보며, 나는 어떤 사람이었는지 생각해보세요.",
    "오늘의 나에게 전하고 싶은 한 마디가 있다면?",
    "마음속 깊은 곳의 목소리에 귀 기울여보세요.",
    "오늘 나를 가장 행복하게 만든 순간을 기억해보세요.",
    "지금 이 순간 내 마음은 어떤 색깔인가요?",
    "오늘 하루 나는 누구를 위해 살았나요?",
    "마음이 가장 평화로웠던 시간을 떠올려보세요.",
    "오늘의 나에게 칭찬해주고 싶은 점이 있다면?",
    "하루 종일 가슴 한편에 머물렀던 생각을 적어보세요.",
    "오늘 나는 어떤 마음으로 사람들을 만났나요?",
    "지금 이 순간 내가 가장 그리운 것은 무엇인가요?",
    "오늘의 경험 중 마음에 가장 깊이 새겨두고 싶은 것은?",
  ],
  
  emotion: [
    "때로는 슬픔도 소중한 감정입니다. 있는 그대로 받아들여보세요.",
    "웃었던 순간들을 기억해보세요. 그 따뜻함을 글로 남겨보세요.",
    "기쁨이든 슬픔이든, 지금 이 감정도 소중한 나의 일부입니다.",
    "마음이 무거울 때일수록, 작은 행복을 찾아보세요.",
    "감정을 억누르지 말고, 종이 위에 자유롭게 풀어놓으세요.",
    "오늘의 감정들이 내일의 나를 더 단단하게 만들어줄 거예요.",
    "눈물이 나더라도 괜찮아요. 그것도 마음을 정화하는 방법입니다.",
    "행복했던 순간을 글로 적으면서 그 기분을 다시 느껴보세요.",
    "마음속 감정들을 색깔로 표현한다면 어떤 색일까요?",
    "오늘 느낀 모든 감정들에게 고마움을 전해보세요.",
    "감정의 파도가 지나가는 것을 지켜보며 기록해보세요.",
    "내 마음의 날씨는 지금 어떤가요? 맑음? 흐림? 비?",
    "감정도 계절처럼 변한다는 걸 기억하세요.",
    "오늘의 감정을 한 줄로 요약한다면?",
    "마음이 시키는 대로 자유롭게 써보세요.",
  ],
  
  relationship: [
    "오늘 만난 사람들 중 누구에게 고마움을 느꼈나요?",
    "가족이나 친구에게 하고 싶었던 말을 적어보세요.",
    "오늘 누군가에게 따뜻함을 전했던 순간이 있나요?",
    "소중한 사람과의 대화 중 기억에 남는 말이 있다면?",
    "오늘 누군가의 미소가 나를 행복하게 만들었나요?",
    "마음을 나누고 싶은 사람이 지금 생각나시나요?",
    "오늘 받은 작은 친절이나 배려를 기록해보세요.",
    "누군가에게 미안한 마음이 있다면 솔직하게 적어보세요.",
    "오늘 내가 누군가에게 도움이 되었던 순간이 있나요?",
    "가장 그리운 사람에게 편지를 쓴다면?",
    "오늘의 만남들이 내게 준 의미를 생각해보세요.",
    "혼자였지만 외롭지 않았던 순간, 함께였지만 외로웠던 순간은?",
    "오늘 누군가의 마음을 이해할 수 있었던 순간이 있나요?",
    "내가 사랑하는 사람들의 얼굴을 떠올리며 써보세요.",
    "오늘 새로운 인연이나 깊어진 관계가 있었나요?",
  ],
  
  growth: [
    "오늘 새롭게 배운 것이나 깨달은 점이 있다면 기록해보세요.",
    "어제보다 조금이라도 나아진 모습을 찾아보세요.",
    "오늘 나의 한계를 뛰어넘으려 노력했던 순간이 있나요?",
    "실수나 실패에서도 배울 점을 찾아보세요.",
    "미래의 나에게 지금의 경험이 어떤 도움이 될까요?",
    "오늘의 도전이 내일의 성장으로 이어질 거예요.",
    "작은 변화라도 그것이 시작이라는 걸 기억하세요.",
    "오늘 내가 용기를 냈던 순간을 기록해보세요.",
    "어려운 상황에서도 포기하지 않은 나를 칭찬해주세요.",
    "오늘의 경험이 나를 더 지혜롭게 만들었나요?",
    "새로운 시각으로 바라본 것들이 있다면?",
    "오늘 내가 한 선택들을 돌아보며 배운 점은?",
    "힘들었지만 끝까지 해낸 일이 있나요?",
    "오늘의 나를 어제의 나와 비교해보세요.",
    "성장하고 있는 나 자신을 믿어보세요.",
  ],
  
  gratitude: [
    "오늘 가장 감사한 세 가지를 적어보세요.",
    "작은 일상 속에서 찾은 행복을 기록해보세요.",
    "나를 위해 힘써준 사람들을 떠올리며 감사 인사를 써보세요.",
    "오늘 내가 누릴 수 있었던 것들에 감사해보세요.",
    "건강한 하루를 보낼 수 있어서 감사하다는 마음을 적어보세요.",
    "따뜻한 잠자리, 맛있는 음식... 당연한 것들에 감사해보세요.",
    "오늘 나를 웃게 만든 것들을 나열해보세요.",
    "사계절의 변화, 자연의 아름다움에 감사한 마음을 써보세요.",
    "가족, 친구들의 존재에 대한 감사함을 표현해보세요.",
    "오늘 하루 무사히 보낼 수 있어서 감사합니다.",
    "내가 가진 작은 재능이나 능력에 감사해보세요.",
    "어려움 속에서도 나를 지켜준 것들을 생각해보세요.",
    "오늘의 모든 순간들이 선물이었다고 생각해보세요.",
    "나를 사랑해주는 사람들이 있어서 감사합니다.",
    "지금 이 순간, 글을 쓸 수 있어서 감사합니다.",
  ]
}

// 날짜 기반 시드 생성
function generateSeed(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return year * 10000 + month * 100 + day
}

// 시드를 사용한 안정적인 랜덤 함수
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// 날짜별 일기 조언 생성
export function generateDiaryAdvice(date: Date): {
  advice: string
  category: keyof AdviceCategory
} {
  const seed = generateSeed(date)
  const categories = Object.keys(DIARY_ADVICE_DATABASE) as (keyof AdviceCategory)[]
  
  // 카테고리 선택 (날짜별로 고정)
  const categoryIndex = Math.floor(seededRandom(seed) * categories.length)
  const selectedCategory = categories[categoryIndex]
  
  // 해당 카테고리에서 조언 선택
  const adviceArray = DIARY_ADVICE_DATABASE[selectedCategory]
  const adviceIndex = Math.floor(seededRandom(seed + 1) * adviceArray.length)
  const selectedAdvice = adviceArray[adviceIndex]
  
  return {
    advice: selectedAdvice,
    category: selectedCategory
  }
}

// 카테고리별 아이콘 반환
export function getCategoryIcon(category: keyof AdviceCategory): string {
  const icons = {
    reflection: '🤔',
    emotion: '💝',
    relationship: '👥',
    growth: '🌱',
    gratitude: '🙏'
  }
  return icons[category]
}

// 카테고리별 색상 반환  
export function getCategoryColor(category: keyof AdviceCategory): string {
  const colors = {
    reflection: '#8B5CF6', // 보라색
    emotion: '#EC4899',    // 핑크색
    relationship: '#3B82F6', // 파란색
    growth: '#10B981',     // 초록색
    gratitude: '#F59E0B'   // 황금색
  }
  return colors[category]
}