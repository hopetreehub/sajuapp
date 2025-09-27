/**
 * 한국어 검색 최적화 유틸리티
 * - 초성 검색 지원
 * - 자모 분리/조합
 * - 한글 텍스트 정규화
 */

// 한글 유니코드 범위
const HANGUL_START = 44032; // '가'
const HANGUL_END = 55203;   // '힣'

// 초성, 중성, 종성 배열
const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

const JUNGSUNG = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
];

const JONGSUNG = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

/**
 * 한글 문자를 초성, 중성, 종성으로 분리
 */
export function decomposeHangul(char: string): { cho: string; jung: string; jong: string } | null {
  const code = char.charCodeAt(0);

  if (code < HANGUL_START || code > HANGUL_END) {
    return null;
  }

  const base = code - HANGUL_START;
  const cho = Math.floor(base / (21 * 28));
  const jung = Math.floor((base % (21 * 28)) / 28);
  const jong = base % 28;

  return {
    cho: CHOSUNG[cho],
    jung: JUNGSUNG[jung],
    jong: JONGSUNG[jong],
  };
}

/**
 * 초성, 중성, 종성으로 한글 문자 조합
 */
export function composeHangul(cho: string, jung: string, jong: string = ''): string {
  const choIndex = CHOSUNG.indexOf(cho);
  const jungIndex = JUNGSUNG.indexOf(jung);
  const jongIndex = JONGSUNG.indexOf(jong);

  if (choIndex === -1 || jungIndex === -1 || jongIndex === -1) {
    return '';
  }

  const code = HANGUL_START + (choIndex * 21 * 28) + (jungIndex * 28) + jongIndex;
  return String.fromCharCode(code);
}

/**
 * 문자열에서 초성만 추출
 */
export function extractChosung(text: string): string {
  return Array.from(text)
    .map(char => {
      const decomposed = decomposeHangul(char);
      return decomposed ? decomposed.cho : char;
    })
    .join('');
}

/**
 * 문자열을 자모로 완전 분해
 */
export function decomposeToJamo(text: string): string {
  return Array.from(text)
    .map(char => {
      const decomposed = decomposeHangul(char);
      if (decomposed) {
        return decomposed.cho + decomposed.jung + decomposed.jong;
      }
      return char;
    })
    .join('');
}

/**
 * 초성 검색 매칭
 */
export function matchChosung(text: string, query: string): boolean {
  if (!query || !text) return false;

  const textChosung = extractChosung(text);
  const queryChosung = extractChosung(query);

  return textChosung.toLowerCase().includes(queryChosung.toLowerCase());
}

/**
 * 한글 텍스트 정규화 (완성형으로 변환)
 */
export function normalizeHangul(text: string): string {
  // 자모 조합 로직 (복잡하므로 기본 구현)
  return text.normalize('NFC');
}

/**
 * 한국어 검색 점수 계산
 */
export function calculateKoreanScore(text: string, query: string): number {
  if (!text || !query) return 0;

  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  let score = 0;

  // 1. 완전 일치 (가장 높은 점수)
  if (normalizedText.includes(normalizedQuery)) {
    score += 100;
  }

  // 2. 초성 매칭
  if (matchChosung(text, query)) {
    score += 50;
  }

  // 3. 자모 단위 매칭
  const textJamo = decomposeToJamo(text);
  const queryJamo = decomposeToJamo(query);
  if (textJamo.toLowerCase().includes(queryJamo.toLowerCase())) {
    score += 25;
  }

  // 4. 시작 부분 매칭 보너스
  if (normalizedText.startsWith(normalizedQuery)) {
    score += 30;
  }

  // 5. 초성으로 시작하는 경우 보너스
  const textChosung = extractChosung(text);
  const queryChosung = extractChosung(query);
  if (textChosung.toLowerCase().startsWith(queryChosung.toLowerCase())) {
    score += 20;
  }

  return score;
}

/**
 * 한국어 검색 필터 함수
 */
export function filterByKoreanSearch<T>(
  items: T[],
  query: string,
  getSearchText: (item: T) => string,
  minScore: number = 10,
): Array<T & { searchScore: number }> {
  if (!query.trim()) {
    return items.map(item => ({ ...item, searchScore: 0 }));
  }

  return items
    .map(item => {
      const searchText = getSearchText(item);
      const score = calculateKoreanScore(searchText, query);
      return { ...item, searchScore: score };
    })
    .filter(item => item.searchScore >= minScore)
    .sort((a, b) => b.searchScore - a.searchScore);
}

/**
 * 검색어 하이라이트 (한국어 지원)
 */
export function highlightKoreanText(text: string, query: string): string {
  if (!query || !text) return text;

  const _normalizedQuery = query.toLowerCase();
  const _normalizedText = text.toLowerCase();

  // 1. 완전 일치 하이라이트
  const exactRegex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  const highlighted = text.replace(exactRegex, '<mark>$1</mark>');

  // 2. 초성 매칭 하이라이트 (복잡하므로 생략, 필요시 구현)

  return highlighted;
}

/**
 * 정규식 특수문자 이스케이프
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 한국어 검색 제안어 생성
 */
export function generateKoreanSuggestions(
  items: string[],
  query: string,
  maxSuggestions: number = 5,
): string[] {
  if (!query.trim()) return [];

  const suggestions = new Set<string>();

  items.forEach(item => {
    const score = calculateKoreanScore(item, query);
    if (score > 10) {
      suggestions.add(item);
    }
  });

  return Array.from(suggestions)
    .slice(0, maxSuggestions)
    .sort((a, b) => calculateKoreanScore(b, query) - calculateKoreanScore(a, query));
}

/**
 * 검색 결과 하이라이트용 정보 생성
 */
export interface HighlightInfo {
  original: string;
  highlighted: string;
  matches: Array<{ start: number; end: number; type: 'exact' | 'chosung' | 'partial' }>;
}

export function getHighlightInfo(text: string, query: string): HighlightInfo {
  const matches: HighlightInfo['matches'] = [];
  let highlighted = text;

  // 완전 일치 찾기
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  let startIndex = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const index = normalizedText.indexOf(normalizedQuery, startIndex);
    if (index === -1) break;

    matches.push({
      start: index,
      end: index + query.length,
      type: 'exact',
    });

    startIndex = index + 1;
  }

  // 하이라이트 적용
  highlighted = highlightKoreanText(text, query);

  return {
    original: text,
    highlighted,
    matches,
  };
}

export default {
  decomposeHangul,
  composeHangul,
  extractChosung,
  decomposeToJamo,
  matchChosung,
  normalizeHangul,
  calculateKoreanScore,
  filterByKoreanSearch,
  highlightKoreanText,
  generateKoreanSuggestions,
  getHighlightInfo,
};