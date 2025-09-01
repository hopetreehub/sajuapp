// 9개 대항목 구조로 완전 재편성된 데이터
import { SajuRadarCategory } from '@/types/sajuRadar'

export const SAJU_RADAR_CATEGORIES: SajuRadarCategory[] = [
  // 1. 주본 (기존 4개 + 주운 추가)
  {
    id: 'jubon',
    name: '주본',
    icon: '🎯',
    description: '근본본, 성향, 욕정, 주격, 주운 분석',
    subcategories: [
      {
        id: 'geunbonbon',
        name: '근본본',
        items: [
          { id: 'geunbon', name: '근본', baseScore: 75 },
          { id: 'sago', name: '사고', baseScore: 70 },
          { id: 'inyeon', name: '인연', baseScore: 65 },
          { id: 'haengdong', name: '행동', baseScore: 72 },
          { id: 'haengun', name: '행운', baseScore: 68 },
          { id: 'hwangyeong', name: '환경', baseScore: 70 }
        ]
      },
      {
        id: 'seonghyang',
        name: '성향',
        items: [
          { id: 'gamseong', name: '감성', baseScore: 70 },
          { id: 'nonriseong', name: '논리성', baseScore: 68 },
          { id: 'yesulseong', name: '예술성', baseScore: 65 },
          { id: 'iseong', name: '이성', baseScore: 72 },
          { id: 'inseong', name: '인성', baseScore: 75 },
          { id: 'jiseong', name: '지성', baseScore: 70 },
          { id: 'hakseupseong', name: '학습성', baseScore: 68 }
        ]
      },
      {
        id: 'yokjeong',
        name: '욕정',
        items: [
          { id: 'gwonryeokyok', name: '권력욕', baseScore: 60 },
          { id: 'gippeum', name: '기쁨', baseScore: 75 },
          { id: 'noyeoum', name: '노여움', baseScore: 45 },
          { id: 'duryeoum', name: '두려움', baseScore: 40 },
          { id: 'myeongyeyok', name: '명예욕', baseScore: 65 },
          { id: 'muryok', name: '물욕', baseScore: 55 },
          { id: 'mium', name: '미움', baseScore: 35 },
          { id: 'saram', name: '사람', baseScore: 70 },
          { id: 'saegyok', name: '색욕', baseScore: 50 },
          { id: 'soyuyok', name: '소유욕', baseScore: 60 },
          { id: 'sumyeonyok', name: '수면욕', baseScore: 65 },
          { id: 'seulpeum', name: '슬픔', baseScore: 45 },
          { id: 'seungbuyok', name: '승부욕', baseScore: 70 },
          { id: 'sigyok', name: '식욕', baseScore: 60 },
          { id: 'yoksim', name: '욕심', baseScore: 55 },
          { id: 'jeulgeoum', name: '즐거움', baseScore: 75 }
        ]
      },
      {
        id: 'jugak',
        name: '주격',
        items: [
          { id: 'gaebangjeogin', name: '개방적', baseScore: 70 },
          { id: 'gyesanjeogin', name: '계산적', baseScore: 65 },
          { id: 'geungjeongjeeogin', name: '긍정적', baseScore: 75 },
          { id: 'baetajeogin', name: '배타적', baseScore: 45 },
          { id: 'bujeongjeogin', name: '부정적', baseScore: 40 },
          { id: 'sagyojeogin', name: '사교적', baseScore: 70 },
          { id: 'igijeogin', name: '이기적', baseScore: 50 },
          { id: 'jinchwijeogin', name: '진취적', baseScore: 72 },
          { id: 'haprijeogin', name: '합리적', baseScore: 75 },
          { id: 'heuisaengjeogin', name: '희생적', baseScore: 65 }
        ]
      },
      {
        id: 'juun',
        name: '주운',
        items: [
          { id: 'geongangun', name: '건강운', baseScore: 70 },
          { id: 'gyeolhonun', name: '결혼운', baseScore: 65 },
          { id: 'gwonryeogun', name: '권력운', baseScore: 60 },
          { id: 'myeongyeun', name: '명예운', baseScore: 62 },
          { id: 'sagoun', name: '사고운', baseScore: 45 },
          { id: 'saeobun', name: '사업운', baseScore: 68 },
          { id: 'idongun', name: '이동운', baseScore: 55 },
          { id: 'ibyeorun', name: '이별운', baseScore: 40 },
          { id: 'inyeonun', name: '인연운', baseScore: 72 },
          { id: 'jasigun', name: '자식운', baseScore: 65 },
          { id: 'jaeneungun', name: '재능운', baseScore: 70 },
          { id: 'jaemorun', name: '재물운', baseScore: 60 },
          { id: 'josangun', name: '조상운', baseScore: 58 },
          { id: 'jigeobun', name: '직업운', baseScore: 68 },
          { id: 'jibangun', name: '집안운', baseScore: 65 },
          { id: 'hageobun', name: '학업운', baseScore: 70 },
          { id: 'haengunun', name: '행운운', baseScore: 60 }
        ]
      }
    ]
  },

  // 2. 주건 (기존 5개 + 뇌 추가)
  {
    id: 'jugeon',
    name: '주건',
    icon: '💪',
    description: '비만, 심리, 인체계, 정력, 질환, 뇌 분석',
    subcategories: [
      {
        id: 'biman',
        name: '비만',
        items: [
          { id: 'geongangsikpum', name: '건강식품', baseScore: 70 },
          { id: 'gwanri', name: '관리', baseScore: 65 },
          { id: 'dansik', name: '단식', baseScore: 50 },
          { id: 'boyak', name: '보약', baseScore: 60 },
          { id: 'sangdam', name: '상담', baseScore: 65 },
          { id: 'sumyeon', name: '수면', baseScore: 70 },
          { id: 'subun', name: '수분', baseScore: 75 },
          { id: 'undong', name: '운동', baseScore: 68 },
          { id: 'eumsik', name: '음식', baseScore: 65 },
          { id: 'chehyeong', name: '체형', baseScore: 60 },
          { id: 'chiryo', name: '치료', baseScore: 70 },
          { id: 'keondisyeon', name: '컨디션', baseScore: 72 }
        ]
      },
      {
        id: 'simri',
        name: '심리',
        items: [
          { id: 'galdeung', name: '갈등', baseScore: 45 },
          { id: 'gonoe', name: '고뇌', baseScore: 40 },
          { id: 'nakgwan', name: '낙관', baseScore: 75 },
          { id: 'mugwansim', name: '무관심', baseScore: 50 },
          { id: 'buran', name: '불안', baseScore: 45 },
          { id: 'sinjung', name: '신중', baseScore: 70 },
          { id: 'uul', name: '우울', baseScore: 35 },
          { id: 'uisim', name: '의심', baseScore: 50 },
          { id: 'jiltu', name: '질투', baseScore: 40 },
          { id: 'jjajeung', name: '짜증', baseScore: 45 },
          { id: 'hogisim', name: '호기심', baseScore: 75 },
          { id: 'heungbun', name: '흥분', baseScore: 60 }
        ]
      },
      {
        id: 'inchegye',
        name: '인체계',
        items: [
          { id: 'golgegyae', name: '골격계', baseScore: 65 },
          { id: 'geunukgye', name: '근육계', baseScore: 68 },
          { id: 'namsaengsiggye', name: '남생식기', baseScore: 60 },
          { id: 'naebungye', name: '내분비계', baseScore: 70 },
          { id: 'sohwagye', name: '소화계', baseScore: 68 },
          { id: 'sunhwangye', name: '순환계', baseScore: 72 },
          { id: 'singyeonggye', name: '신경계', baseScore: 75 },
          { id: 'oebungye', name: '외분비계', baseScore: 65 },
          { id: 'oehyeonggye', name: '외형계', baseScore: 60 },
          { id: 'jeonsingye', name: '정신계', baseScore: 70 },
          { id: 'pibugye', name: '피부계', baseScore: 65 },
          { id: 'hoheupgye', name: '호흡계', baseScore: 72 }
        ]
      },
      {
        id: 'jeongryeok',
        name: '정력',
        items: [
          { id: 'dolbal', name: '돌발', baseScore: 55 },
          { id: 'sekseu', name: '섹스', baseScore: 65 },
          { id: 'seutemina', name: '스테미나', baseScore: 70 },
          { id: 'oreugarijeum', name: '오르가즘', baseScore: 60 },
          { id: 'joyeol', name: '조절', baseScore: 68 },
          { id: 'junbi', name: '준비', baseScore: 65 },
          { id: 'chungdong', name: '충동', baseScore: 60 },
          { id: 'taim', name: '타임', baseScore: 62 }
        ]
      },
      {
        id: 'jilhwan',
        name: '질환',
        items: [
          { id: 'gamyeomseong', name: '감염성질환', baseScore: 40 },
          { id: 'golsuseong', name: '골수성혈액질환', baseScore: 35 },
          { id: 'gugangmit', name: '구강및악안면병리', baseScore: 45 },
          { id: 'geungolggyae', name: '근골격계장애', baseScore: 50 },
          { id: 'geunuk', name: '근육질환', baseScore: 45 },
          { id: 'naebunbi', name: '내분비질환', baseScore: 40 },
          { id: 'noejilhwan', name: '뇌질환', baseScore: 35 },
          { id: 'rimpeu', name: '림프계면역장애', baseScore: 40 },
          { id: 'manseong', name: '만성피로', baseScore: 50 },
          { id: 'binyugi', name: '비뇨기계질환', baseScore: 45 },
          { id: 'biman_jilhwan', name: '비만질환', baseScore: 40 },
          { id: 'ppyeogol', name: '뼈골절질환', baseScore: 35 },
          { id: 'saengsiggye', name: '생식기질환', baseScore: 40 },
          { id: 'seoncheonseong', name: '선천성질환', baseScore: 30 },
          { id: 'sohwa', name: '소화질환', baseScore: 45 },
          { id: 'sunhwan', name: '순환질환', baseScore: 40 },
          { id: 'singyeonggye_jilhwan', name: '신경계질환', baseScore: 35 },
          { id: 'simhyeolgwan', name: '심혈관질환', baseScore: 40 },
          { id: 'angwa', name: '안과질환', baseScore: 50 },
          { id: 'am', name: '암', baseScore: 25 },
          { id: 'janggi', name: '장기질환', baseScore: 40 },
          { id: 'jeongsin', name: '정신장애', baseScore: 35 },
          { id: 'jeunghugun', name: '증후군', baseScore: 40 },
          { id: 'taae', name: '태아질환', baseScore: 30 },
          { id: 'pibu', name: '피부질환', baseScore: 50 },
          { id: 'horumon', name: '호르몬질환', baseScore: 40 },
          { id: 'hoheup', name: '호흡질환', baseScore: 45 }
        ]
      },
      {
        id: 'noe',
        name: '뇌',
        items: [
          { id: 'gannoe', name: '간뇌', baseScore: 65 },
          { id: 'noehasuche', name: '뇌하수체', baseScore: 68 },
          { id: 'daenoe', name: '대뇌', baseScore: 75 },
          { id: 'duchungeop', name: '두충엽', baseScore: 60 },
          { id: 'byeongyeongeop', name: '변연엽', baseScore: 62 },
          { id: 'sonoe', name: '소뇌', baseScore: 70 },
          { id: 'sisang', name: '시상', baseScore: 65 },
          { id: 'sisanghabu', name: '시상하부', baseScore: 68 },
          { id: 'yeonsu', name: '연수', baseScore: 72 },
          { id: 'jeondueop', name: '전두엽', baseScore: 75 },
          { id: 'jeoneop', name: '전엽', baseScore: 70 },
          { id: 'jungnoe', name: '중뇌', baseScore: 68 },
          { id: 'jungeop', name: '중엽', baseScore: 65 },
          { id: 'cheoksu', name: '척수', baseScore: 60 },
          { id: 'cheukdueop', name: '측두엽', baseScore: 70 },
          { id: 'hutueop', name: '후투엽', baseScore: 65 },
          { id: 'hueop', name: '후엽', baseScore: 68 }
        ]
      }
    ]
  },

  // 3. 주물 (새로 추가)
  {
    id: 'jumul',
    name: '주물',
    icon: '💰',
    description: '부동산, 재물, 투자 분석',
    subcategories: [
      {
        id: 'budongsan',
        name: '부동산',
        items: [
          { id: 'geonmul', name: '건물', baseScore: 65 },
          { id: 'gongjang', name: '공장', baseScore: 60 },
          { id: 'dagagu', name: '다가구', baseScore: 62 },
          { id: 'budongsan_item', name: '부동산', baseScore: 70 },
          { id: 'dasedae', name: '다세대', baseScore: 63 },
          { id: 'dandok', name: '단독', baseScore: 68 },
          { id: 'daeji', name: '대지', baseScore: 65 },
          { id: 'sangga', name: '상가', baseScore: 72 },
          { id: 'apateu', name: '아파트', baseScore: 75 },
          { id: 'yeonrip', name: '연립', baseScore: 60 },
          { id: 'opiseu', name: '오피스', baseScore: 70 },
          { id: 'jusangbokhap', name: '주상복합', baseScore: 68 },
          { id: 'jutaek', name: '주택', baseScore: 67 }
        ]
      },
      {
        id: 'jaemul',
        name: '재물',
        items: [
          { id: 'daeyeo', name: '대여', baseScore: 55 },
          { id: 'dongsan', name: '동산', baseScore: 60 },
          { id: 'budongsan_jaemul', name: '부동산', baseScore: 70 },
          { id: 'saeop', name: '사업', baseScore: 65 },
          { id: 'jusik', name: '주식', baseScore: 62 },
          { id: 'chaegwon', name: '채권', baseScore: 58 },
          { id: 'tuja', name: '투자', baseScore: 60 },
          { id: 'peondeu', name: '펀드', baseScore: 57 },
          { id: 'hyeongeum', name: '현금', baseScore: 75 }
        ]
      },
      {
        id: 'tuja_jumul',
        name: '투자',
        items: [
          { id: 'daeyeo_tuja', name: '대여', baseScore: 55 },
          { id: 'dongsan_tuja', name: '동산', baseScore: 58 },
          { id: 'budongsan_tuja', name: '부동산', baseScore: 70 },
          { id: 'jusik_tuja', name: '주식', baseScore: 65 },
          { id: 'chaegwon_tuja', name: '채권', baseScore: 60 },
          { id: 'peondeu_tuja', name: '펀드', baseScore: 58 },
          { id: 'gisul', name: '기술', baseScore: 68 },
          { id: 'bangsong', name: '방송', baseScore: 62 },
          { id: 'seonmul', name: '선물', baseScore: 55 },
          { id: 'yeneung', name: '예능', baseScore: 60 },
          { id: 'inryeok', name: '인력', baseScore: 63 },
          { id: 'jepum', name: '제품', baseScore: 65 }
        ]
      }
    ]
  },

  // 4. 주연 (기존 7개 + 가정, 가족 추가)
  {
    id: 'juyeon',
    name: '주연',
    icon: '🤝',
    description: '외가, 이성, 인연, 선배, 친가, 친구, 후배, 가정, 가족 분석',
    subcategories: [
      {
        id: 'oega',
        name: '외가',
        items: [
          { id: 'oesachon', name: '외사촌', baseScore: 65 },
          { id: 'oesamchon', name: '외삼촌', baseScore: 70 },
          { id: 'oesukmo', name: '외숙모', baseScore: 68 },
          { id: 'oejomo', name: '외조모', baseScore: 75 },
          { id: 'oejobu', name: '외조부', baseScore: 72 },
          { id: 'oejoka', name: '외조카', baseScore: 60 },
          { id: 'oejongomo', name: '외종조모', baseScore: 65 },
          { id: 'oejongjobu', name: '외종조부', baseScore: 68 },
          { id: 'imo', name: '이모', baseScore: 70 },
          { id: 'imobu', name: '이모부', baseScore: 65 }
        ]
      },
      {
        id: 'iseong',
        name: '이성',
        items: [
          { id: 'gohyangiseong', name: '고향이성', baseScore: 60 },
          { id: 'dandaeiseong', name: '단체이성', baseScore: 65 },
          { id: 'dongneiseong', name: '동네이성', baseScore: 68 },
          { id: 'dongmuniseong', name: '동문이성', baseScore: 70 },
          { id: 'moimiseong', name: '모임이성', baseScore: 65 },
          { id: 'hoesaiseong', name: '회사이성', baseScore: 72 }
        ]
      },
      {
        id: 'inyeon',
        name: '인연',
        items: [
          { id: 'iseong_inyeon', name: '이성', baseScore: 70 },
          { id: 'baeuja', name: '배우자', baseScore: 75 },
          { id: 'gajok', name: '가족', baseScore: 80 },
          { id: 'guin', name: '귀인', baseScore: 65 },
          { id: 'dongryo', name: '동료', baseScore: 68 },
          { id: 'dongmun', name: '동문', baseScore: 65 },
          { id: 'donghyang', name: '동향', baseScore: 60 },
          { id: 'seonbae_inyeon', name: '선배', baseScore: 70 },
          { id: 'seuseung', name: '스승', baseScore: 72 },
          { id: 'aein', name: '애인', baseScore: 75 },
          { id: 'oega_inyeon', name: '외가', baseScore: 68 },
          { id: 'chinga_inyeon', name: '친가', baseScore: 70 }
        ]
      },
      {
        id: 'seonbae',
        name: '선배',
        items: [
          { id: 'gohyangseonbae', name: '고향선배', baseScore: 65 },
          { id: 'dandaeseonbae', name: '단체선배', baseScore: 68 },
          { id: 'dongneseonbae', name: '동네선배', baseScore: 60 },
          { id: 'dongmunseonbae', name: '동문선배', baseScore: 70 },
          { id: 'moimseonbae', name: '모임선배', baseScore: 65 },
          { id: 'iseongseonbae', name: '이성선배', baseScore: 68 },
          { id: 'hoesaseonbae', name: '회사선배', baseScore: 75 }
        ]
      },
      {
        id: 'chinga',
        name: '친가',
        items: [
          { id: 'gomo', name: '고모', baseScore: 68 },
          { id: 'gomobu', name: '고모부', baseScore: 65 },
          { id: 'baekmo', name: '백모', baseScore: 70 },
          { id: 'baekbu', name: '백부', baseScore: 72 },
          { id: 'sachon', name: '사촌', baseScore: 65 },
          { id: 'samchon', name: '삼촌', baseScore: 70 },
          { id: 'sukmo', name: '숙모', baseScore: 68 },
          { id: 'jomo', name: '조모', baseScore: 75 },
          { id: 'jobu', name: '조부', baseScore: 72 },
          { id: 'joka', name: '조카', baseScore: 60 },
          { id: 'jeungjomo', name: '증조모', baseScore: 65 },
          { id: 'jeungjobu', name: '증조부', baseScore: 68 }
        ]
      },
      {
        id: 'chingu',
        name: '친구',
        items: [
          { id: 'gohyangchingu', name: '고향친구', baseScore: 65 },
          { id: 'dandaechingu', name: '단체친구', baseScore: 68 },
          { id: 'dongnechingu', name: '동네친구', baseScore: 70 },
          { id: 'dongmunchingu', name: '동문친구', baseScore: 72 },
          { id: 'moimchingu', name: '모임친구', baseScore: 65 },
          { id: 'iseongchingu', name: '이성친구', baseScore: 75 },
          { id: 'hoesachingu', name: '회사친구', baseScore: 68 }
        ]
      },
      {
        id: 'hubae',
        name: '후배',
        items: [
          { id: 'gohyanghubae', name: '고향후배', baseScore: 60 },
          { id: 'dandaehubae', name: '단체후배', baseScore: 65 },
          { id: 'dongnehubae', name: '동네후배', baseScore: 62 },
          { id: 'dongmunhubae', name: '동문후배', baseScore: 68 },
          { id: 'moimhubae', name: '모임후배', baseScore: 60 },
          { id: 'iseonghubae', name: '이성후배', baseScore: 65 },
          { id: 'hoesahubae', name: '회사후배', baseScore: 70 }
        ]
      },
      {
        id: 'gajeong',
        name: '가정',
        items: [
          { id: 'ttal', name: '딸', baseScore: 75 },
          { id: 'baeuja_gajeong', name: '배우자', baseScore: 80 },
          { id: 'adeul', name: '아들', baseScore: 75 }
        ]
      },
      {
        id: 'gajok_juyeon',
        name: '가족',
        items: [
          { id: 'nuna', name: '누나', baseScore: 68 },
          { id: 'dongsaeng', name: '동생', baseScore: 65 },
          { id: 'abeoji', name: '아버지', baseScore: 78 },
          { id: 'eomeoni', name: '어머니', baseScore: 80 },
          { id: 'halmeoni', name: '할머니', baseScore: 72 },
          { id: 'harabeoji', name: '할아버지', baseScore: 70 },
          { id: 'hyeong', name: '형', baseScore: 68 }
        ]
      }
    ]
  },

  // 5. 주재 (기존 유지 - 3개 중항목)
  {
    id: 'jujae',
    name: '주재',
    icon: '🎨',
    description: '논리, 예술, 학습 분석',
    subcategories: [
      {
        id: 'nonri',
        name: '논리',
        items: [
          { id: 'undong', name: '운동', baseScore: 65 },
          { id: 'gamgak', name: '감각', baseScore: 70 },
          { id: 'gaenyeom', name: '개념', baseScore: 72 },
          { id: 'gieok', name: '기억', baseScore: 68 },
          { id: 'nonri_item', name: '논리', baseScore: 75 },
          { id: 'migak', name: '미각', baseScore: 60 },
          { id: 'bunseok', name: '분석', baseScore: 75 },
          { id: 'suri', name: '수리', baseScore: 70 },
          { id: 'sigak', name: '시각', baseScore: 68 },
          { id: 'eohi', name: '어휘', baseScore: 72 },
          { id: 'eoneo', name: '언어', baseScore: 75 },
          { id: 'yeonsan', name: '연산', baseScore: 70 },
          { id: 'ihae', name: '이해', baseScore: 75 },
          { id: 'insik', name: '인식', baseScore: 72 },
          { id: 'inji', name: '인지', baseScore: 70 },
          { id: 'jeonryak', name: '전략', baseScore: 68 },
          { id: 'jinhaeng', name: '진행', baseScore: 65 },
          { id: 'jipjung', name: '집중', baseScore: 72 },
          { id: 'cheonggak', name: '청각', baseScore: 68 },
          { id: 'tongje', name: '통제', baseScore: 65 },
          { id: 'pyeonghaeng', name: '평행', baseScore: 60 },
          { id: 'hakseup_nonri', name: '학습', baseScore: 75 },
          { id: 'hoheup_nonri', name: '호흡', baseScore: 65 },
          { id: 'hwasul', name: '화술', baseScore: 70 }
        ]
      },
      {
        id: 'yesul',
        name: '예술',
        items: [
          { id: 'sumyeon_yesul', name: '수면', baseScore: 65 },
          { id: 'joyeol_yesul', name: '조절', baseScore: 68 },
          { id: 'chungdong_yesul', name: '충동', baseScore: 60 },
          { id: 'geim', name: '게임', baseScore: 70 },
          { id: 'muyong', name: '무용', baseScore: 65 },
          { id: 'misul', name: '미술', baseScore: 70 },
          { id: 'banbok', name: '반복', baseScore: 62 },
          { id: 'byeonhwa', name: '변화', baseScore: 75 },
          { id: 'bijeon', name: '비젼', baseScore: 68 },
          { id: 'sangsang', name: '상상', baseScore: 75 },
          { id: 'saeksang', name: '색상', baseScore: 68 },
          { id: 'saenggak', name: '생각', baseScore: 72 },
          { id: 'yeonye', name: '연예', baseScore: 60 },
          { id: 'yeoljeong', name: '열정', baseScore: 75 },
          { id: 'yuhok', name: '유혹', baseScore: 55 },
          { id: 'eumak', name: '음악', baseScore: 70 },
          { id: 'jageuk', name: '자극', baseScore: 65 },
          { id: 'jeontal', name: '전달', baseScore: 70 },
          { id: 'jejak', name: '제작', baseScore: 68 },
          { id: 'jungdok', name: '중독', baseScore: 50 },
          { id: 'changjak', name: '창작', baseScore: 75 },
          { id: 'chegye', name: '체계', baseScore: 65 },
          { id: 'hyeongsang', name: '형상', baseScore: 70 },
          { id: 'hwaldong_yesul', name: '활동', baseScore: 72 }
        ]
      },
      {
        id: 'hakseup',
        name: '학습',
        items: [
          { id: 'nonri_hakseup', name: '논리', baseScore: 75 },
          { id: 'bunseok_hakseup', name: '분석', baseScore: 72 },
          { id: 'suri_hakseup', name: '수리', baseScore: 70 },
          { id: 'eoneo_hakseup', name: '언어', baseScore: 75 },
          { id: 'ihae_hakseup', name: '이해', baseScore: 75 },
          { id: 'jipjung_hakseup', name: '집중', baseScore: 70 },
          { id: 'changjak_hakseup', name: '창작', baseScore: 68 },
          { id: 'gyesan', name: '계산', baseScore: 70 },
          { id: 'dohyeong', name: '도형', baseScore: 65 },
          { id: 'mobang', name: '모방', baseScore: 60 },
          { id: 'munjang', name: '문장', baseScore: 72 },
          { id: 'bokseup', name: '복습', baseScore: 70 },
          { id: 'bunbae', name: '분배', baseScore: 65 },
          { id: 'seontaek', name: '선택', baseScore: 68 },
          { id: 'sigan', name: '시간', baseScore: 65 },
          { id: 'amgi', name: '암기', baseScore: 68 },
          { id: 'yeseup', name: '예습', baseScore: 70 },
          { id: 'yuchu', name: '유추', baseScore: 72 },
          { id: 'eungyong', name: '응용', baseScore: 75 },
          { id: 'jeongni', name: '정리', baseScore: 68 },
          { id: 'jiri', name: '지리', baseScore: 60 },
          { id: 'pandoan', name: '판단', baseScore: 72 },
          { id: 'puri', name: '풀이', baseScore: 70 },
          { id: 'haeseok', name: '해석', baseScore: 72 }
        ]
      }
    ]
  },

  // 6. 주업 (기존 유지 - 5개 중항목)
  {
    id: 'jueop',
    name: '주업',
    icon: '💼',
    description: '능력, 성향, 업무, 업종, 직업 분석',
    subcategories: [
      {
        id: 'neungryeok',
        name: '능력',
        items: [
          { id: 'gaebalryeok', name: '개발력', baseScore: 70 },
          { id: 'gaejoryeok', name: '개조력', baseScore: 65 },
          { id: 'gamsuryeok', name: '감수력', baseScore: 60 },
          { id: 'gyesanryeok', name: '계산력', baseScore: 70 },
          { id: 'gwangyeryeok', name: '관계력', baseScore: 72 },
          { id: 'gwanriryeok', name: '관리력', baseScore: 68 },
          { id: 'gisulryeok', name: '기술력', baseScore: 70 },
          { id: 'gieokryeok', name: '기억력', baseScore: 68 },
          { id: 'gihoekryeok', name: '기획력', baseScore: 72 },
          { id: 'nodongryeok', name: '노동력', baseScore: 65 },
          { id: 'rideoryeok', name: '리더력', baseScore: 70 },
          { id: 'munsoryeok', name: '문서력', baseScore: 65 },
          { id: 'balpyoryeok', name: '발표력', baseScore: 68 },
          { id: 'bunseokryeok', name: '분석력', baseScore: 75 },
          { id: 'saengsanryeok', name: '생산력', baseScore: 68 },
          { id: 'seolmyeongryeok', name: '설명력', baseScore: 70 },
          { id: 'sujipryeok', name: '수집력', baseScore: 65 },
          { id: 'sungryeonryeok', name: '숙련력', baseScore: 72 },
          { id: 'eohiryeok', name: '어휘력', baseScore: 70 },
          { id: 'yeongeopryeok', name: '영업력', baseScore: 68 },
          { id: 'eungyongryeok', name: '응용력', baseScore: 72 },
          { id: 'ihaeryeok', name: '이해력', baseScore: 75 },
          { id: 'jeondalryeok', name: '전달력', baseScore: 70 },
          { id: 'jejakkryeok', name: '제작력', baseScore: 68 },
          { id: 'jidoryeok', name: '지도력', baseScore: 70 },
          { id: 'jipjungryeok', name: '집중력', baseScore: 72 },
          { id: 'changyiryeok', name: '창의력', baseScore: 75 },
          { id: 'chaegimryeok', name: '책임력', baseScore: 70 },
          { id: 'cheorryeok', name: '처리력', baseScore: 68 },
          { id: 'chujiryeok', name: '추진력', baseScore: 70 },
          { id: 'pandanryeok', name: '판단력', baseScore: 72 },
          { id: 'panmaeryeok', name: '판매력', baseScore: 65 },
          { id: 'pyeonjipryeok', name: '편집력', baseScore: 68 },
          { id: 'pyohyeonryeok', name: '표현력', baseScore: 70 },
          { id: 'haegeolryeok', name: '해결력', baseScore: 75 },
          { id: 'hwahapryeok', name: '화합력', baseScore: 68 },
          { id: 'hwaldongryeok', name: '활동력', baseScore: 72 }
        ]
      },
      {
        id: 'seonghyang_jueop',
        name: '성향',
        items: [
          { id: 'gwangyeseong', name: '관계성', baseScore: 70 },
          { id: 'gwanriseong', name: '관리성', baseScore: 68 },
          { id: 'bunseokseong', name: '분석성', baseScore: 72 },
          { id: 'sukjiseong', name: '숙지성', baseScore: 65 },
          { id: 'jeonmunseong', name: '전문성', baseScore: 75 },
          { id: 'changyiseong', name: '창의성', baseScore: 70 },
          { id: 'hwaldongseong', name: '활동성', baseScore: 68 }
        ]
      },
      {
        id: 'eommu',
        name: '업무',
        items: [
          { id: 'gaebal', name: '개발', baseScore: 70 },
          { id: 'gyeongni', name: '경리', baseScore: 65 },
          { id: 'gumaae', name: '구매', baseScore: 60 },
          { id: 'nomu', name: '노무', baseScore: 58 },
          { id: 'boan', name: '보안', baseScore: 68 },
          { id: 'saengsan', name: '생산', baseScore: 65 },
          { id: 'segeum', name: '세금', baseScore: 60 },
          { id: 'sosong', name: '소송', baseScore: 55 },
          { id: 'yeongu', name: '연구', baseScore: 75 },
          { id: 'yeongop', name: '영업', baseScore: 68 },
          { id: 'unsong', name: '운송', baseScore: 60 },
          { id: 'unmyeong', name: '운명', baseScore: 50 },
          { id: 'jageum', name: '자금', baseScore: 65 },
          { id: 'junggae', name: '중계', baseScore: 62 },
          { id: 'chuljang', name: '출장', baseScore: 60 },
          { id: 'panmae', name: '판매', baseScore: 65 },
          { id: 'hyeonjang', name: '현장', baseScore: 68 },
          { id: 'hongbo', name: '홍보', baseScore: 70 },
          { id: 'hoegye', name: '회계', baseScore: 68 }
        ]
      },
      {
        id: 'eopjong',
        name: '업종',
        items: [
          { id: 'gyeongyeong', name: '경영', baseScore: 68 },
          { id: 'gyoyuk_gita', name: '교육/기타', baseScore: 70 },
          { id: 'dijain', name: '디자인', baseScore: 65 },
          { id: 'maketing', name: '마케팅', baseScore: 70 },
          { id: 'seobiseu', name: '서비스', baseScore: 68 },
          { id: 'yeonye_bangsong', name: '연예/방송', baseScore: 60 },
          { id: 'yutong', name: '유통', baseScore: 65 },
          { id: 'jeonja_tongsin', name: '전자/통신', baseScore: 72 },
          { id: 'jejjo', name: '제조', baseScore: 68 }
        ]
      },
      {
        id: 'jigeop',
        name: '직업',
        items: [
          { id: 'gongmuwon', name: '공무원', baseScore: 70 },
          { id: 'gyosa', name: '교사', baseScore: 72 },
          { id: 'ganhoha', name: '간호사', baseScore: 68 },
          { id: 'uisa', name: '의사', baseScore: 75 },
          { id: 'byeonsa', name: '변호사', baseScore: 70 },
          { id: 'hoegesa', name: '회계사', baseScore: 68 },
          { id: 'gisulga', name: '기술자', baseScore: 70 },
          { id: 'yesulga', name: '예술가', baseScore: 65 },
          { id: 'saeopga', name: '사업가', baseScore: 65 },
          { id: 'yeongunja', name: '연구자', baseScore: 72 }
        ]
      }
    ]
  },

  // 7. 주생 (새로 추가 - 17개 중항목)
  {
    id: 'jusaeng',
    name: '주생',
    icon: '🌱',
    description: '일상 생활 전반 분석',
    subcategories: [
      {
        id: 'gajok_jusaeng',
        name: '가족',
        items: [
          { id: 'gyeyak', name: '계약', baseScore: 65 },
          { id: 'gyoyuk', name: '교육', baseScore: 70 },
          { id: 'daehwa', name: '대화', baseScore: 72 },
          { id: 'moim', name: '모임', baseScore: 68 },
          { id: 'syoping', name: '쇼핑', baseScore: 65 },
          { id: 'eonjaeng', name: '언쟁', baseScore: 45 },
          { id: 'yeohaeng', name: '여행', baseScore: 70 },
          { id: 'oesik', name: '외식', baseScore: 68 },
          { id: 'isa', name: '이사', baseScore: 60 },
          { id: 'jaesan', name: '재산', baseScore: 65 },
          { id: 'haengsa', name: '행사', baseScore: 68 }
        ]
      },
      {
        id: 'geongang',
        name: '건강',
        items: [
          { id: 'geongangsikpum_geongang', name: '건강식품', baseScore: 70 },
          { id: 'boyak_geongang', name: '보약', baseScore: 62 },
          { id: 'sangdam_geongang', name: '상담', baseScore: 65 },
          { id: 'sumyeon_geongang', name: '수면', baseScore: 72 },
          { id: 'undong_geongang', name: '운동', baseScore: 75 },
          { id: 'eumsik_geongang', name: '음식', baseScore: 68 },
          { id: 'geomsa', name: '검사', baseScore: 60 },
          { id: 'yeohaeng_geongang', name: '여행', baseScore: 70 },
          { id: 'masaji', name: '마사지', baseScore: 68 },
          { id: 'myeongsang', name: '명상', baseScore: 65 },
          { id: 'biman_geongang', name: '비만', baseScore: 50 },
          { id: 'sauna', name: '사우나', baseScore: 62 },
          { id: 'chimi', name: '취미', baseScore: 70 },
          { id: 'hyusik', name: '휴식', baseScore: 75 }
        ]
      },
      {
        id: 'gyeolhon',
        name: '결혼',
        items: [
          { id: 'sago_gyeolhon', name: '사고', baseScore: 40 },
          { id: 'iseong_gyeolhon', name: '이성', baseScore: 70 },
          { id: 'sekseu_gyeolhon', name: '섹스', baseScore: 65 },
          { id: 'saeop_gyeolhon', name: '사업', baseScore: 62 },
          { id: 'gyoyuk_gyeolhon', name: '교육', baseScore: 68 },
          { id: 'isa_gyeolhon', name: '이사', baseScore: 60 },
          { id: 'jaesan_gyeolhon', name: '재산', baseScore: 65 },
          { id: 'geongang_gyeolhon', name: '건강', baseScore: 70 },
          { id: 'bumo', name: '부모', baseScore: 72 },
          { id: 'bunjaeng', name: '분쟁', baseScore: 45 },
          { id: 'yusan', name: '유산', baseScore: 60 },
          { id: 'jasik', name: '자식', baseScore: 75 },
          { id: 'jonggyo', name: '종교', baseScore: 55 },
          { id: 'jigeop_gyeolhon', name: '직업', baseScore: 68 }
        ]
      },
      {
        id: 'gyeyak_jusaeng',
        name: '계약',
        items: [
          { id: 'daeyeo_gyeyak', name: '대여', baseScore: 58 },
          { id: 'dongsan_gyeyak', name: '동산', baseScore: 60 },
          { id: 'budongsan_gyeyak', name: '부동산', baseScore: 70 },
          { id: 'saeop_gyeyak', name: '사업', baseScore: 65 },
          { id: 'jusik_gyeyak', name: '주식', baseScore: 62 },
          { id: 'chaegwon_gyeyak', name: '채권', baseScore: 58 },
          { id: 'peondeu_gyeyak', name: '펀드', baseScore: 55 },
          { id: 'gumae', name: '구매', baseScore: 65 },
          { id: 'gongjeung', name: '공증', baseScore: 60 },
          { id: 'bojeung', name: '보증', baseScore: 55 },
          { id: 'bunsil', name: '분실', baseScore: 40 },
          { id: 'sinyong', name: '신용', baseScore: 72 }
        ]
      },
      {
        id: 'byuti',
        name: '뷰티',
        items: [
          { id: 'geongangsikpum_byuti', name: '건강식품', baseScore: 65 },
          { id: 'boyak_byuti', name: '보약', baseScore: 60 },
          { id: 'sangdam_byuti', name: '상담', baseScore: 62 },
          { id: 'chiryo_byuti', name: '치료', baseScore: 68 },
          { id: 'masaji_byuti', name: '마사지', baseScore: 70 },
          { id: 'gyojeong', name: '교정', baseScore: 65 },
          { id: 'neilateu', name: '네일아트', baseScore: 62 },
          { id: 'seupa', name: '스파', baseScore: 68 },
          { id: 'anmyeon', name: '안면', baseScore: 70 },
          { id: 'oemo', name: '외모', baseScore: 72 },
          { id: 'heeo', name: '헤어', baseScore: 68 },
          { id: 'hwajangpum', name: '화장품', baseScore: 65 }
        ]
      },
      {
        id: 'sago_jusaeng',
        name: '사고',
        items: [
          { id: 'segeum_sago', name: '세금', baseScore: 50 },
          { id: 'sosong_sago', name: '소송', baseScore: 45 },
          { id: 'eonjaeng_sago', name: '언쟁', baseScore: 48 },
          { id: 'jaesan_sago', name: '재산', baseScore: 55 },
          { id: 'bunjaeng_sago', name: '분쟁', baseScore: 45 },
          { id: 'bunsil_sago', name: '분실', baseScore: 40 },
          { id: 'gyotong', name: '교통', baseScore: 50 },
          { id: 'dansok', name: '단속', baseScore: 48 },
          { id: 'donan', name: '도난', baseScore: 35 },
          { id: 'mangsin', name: '망신', baseScore: 38 },
          { id: 'sagi', name: '사기', baseScore: 30 },
          { id: 'wiban', name: '위반', baseScore: 45 },
          { id: 'wiheom', name: '위험', baseScore: 40 },
          { id: 'pokhaeng', name: '폭행', baseScore: 25 }
        ]
      },
      {
        id: 'saeop_jusaeng',
        name: '사업',
        items: [
          { id: 'gwanri_saeop', name: '관리', baseScore: 68 },
          { id: 'jusik_saeop', name: '주식', baseScore: 62 },
          { id: 'tuja_saeop', name: '투자', baseScore: 60 },
          { id: 'gaebal_saeop', name: '개발', baseScore: 70 },
          { id: 'gumae_saeop', name: '구매', baseScore: 65 },
          { id: 'saengsan_saeop', name: '생산', baseScore: 68 },
          { id: 'sosong_saeop', name: '소송', baseScore: 45 },
          { id: 'yeongop_saeop', name: '영업', baseScore: 70 },
          { id: 'jageum_saeop', name: '자금', baseScore: 65 },
          { id: 'gyeyak_saeop', name: '계약', baseScore: 68 },
          { id: 'gihoek', name: '기획', baseScore: 72 },
          { id: 'dongeop', name: '동업', baseScore: 60 }
        ]
      },
      {
        id: 'yeonae',
        name: '연애',
        items: [
          { id: 'iseong_yeonae', name: '이성', baseScore: 72 },
          { id: 'keondisyeon_yeonae', name: '컨디션', baseScore: 68 },
          { id: 'sekseu_yeonae', name: '섹스', baseScore: 65 },
          { id: 'eonjaeng_yeonae', name: '언쟁', baseScore: 45 },
          { id: 'yeohaeng_yeonae', name: '여행', baseScore: 75 },
          { id: 'chimi_yeonae', name: '취미', baseScore: 70 },
          { id: 'gamjeong', name: '감정', baseScore: 72 },
          { id: 'gwanram', name: '관람', baseScore: 68 },
          { id: 'simri', name: '심리', baseScore: 65 },
          { id: 'ibyeol', name: '이별', baseScore: 40 },
          { id: 'hogam', name: '호감', baseScore: 75 }
        ]
      },
      {
        id: 'siheom',
        name: '시험',
        items: [
          { id: 'sumyeon_siheom', name: '수면', baseScore: 70 },
          { id: 'keondisyeon_siheom', name: '컨디션', baseScore: 72 },
          { id: 'gieok_siheom', name: '기억', baseScore: 68 },
          { id: 'jipjung_siheom', name: '집중', baseScore: 75 },
          { id: 'bokseup_siheom', name: '복습', baseScore: 70 },
          { id: 'seontaek_siheom', name: '선택', baseScore: 65 },
          { id: 'yeseup_siheom', name: '예습', baseScore: 68 },
          { id: 'eungyong_siheom', name: '응용', baseScore: 72 },
          { id: 'puri_siheom', name: '풀이', baseScore: 70 },
          { id: 'geongang_siheom', name: '건강', baseScore: 68 },
          { id: 'siheom_item', name: '시험', baseScore: 65 },
          { id: 'junbimul', name: '준비물', baseScore: 60 }
        ]
      },
      {
        id: 'undong_jusaeng',
        name: '운동',
        items: [
          { id: 'gwanri_undong', name: '관리', baseScore: 68 },
          { id: 'gisul_undong', name: '기술', baseScore: 70 },
          { id: 'pyeonghaeng_undong', name: '평행', baseScore: 65 },
          { id: 'banbok_undong', name: '반복', baseScore: 62 },
          { id: 'gonggangam', name: '공간감', baseScore: 68 },
          { id: 'gigu', name: '기구', baseScore: 65 },
          { id: 'giryeok', name: '기력', baseScore: 70 },
          { id: 'danche', name: '단체', baseScore: 68 },
          { id: 'jeongsinryeok', name: '정신력', baseScore: 72 },
          { id: 'jiguryeok', name: '지구력', baseScore: 75 },
          { id: 'hoejeon', name: '회전', baseScore: 65 },
          { id: 'heureum', name: '흐름', baseScore: 68 }
        ]
      },
      {
        id: 'idong',
        name: '이동',
        items: [
          { id: 'iseong_idong', name: '이성', baseScore: 65 },
          { id: 'saeop_idong', name: '사업', baseScore: 68 },
          { id: 'gajok_idong', name: '가족', baseScore: 70 },
          { id: 'chingu_idong', name: '친구', baseScore: 68 },
          { id: 'chuljang_idong', name: '출장', baseScore: 62 },
          { id: 'yeohaeng_idong', name: '여행', baseScore: 75 },
          { id: 'isa_idong', name: '이사', baseScore: 60 },
          { id: 'haengsa_idong', name: '행사', baseScore: 65 },
          { id: 'gohyang', name: '고향', baseScore: 68 },
          { id: 'guknae', name: '국내', baseScore: 70 },
          { id: 'gugoe', name: '국외', baseScore: 65 },
          { id: 'seom', name: '섬', baseScore: 60 },
          { id: 'hageop_idong', name: '학업', baseScore: 68 }
        ]
      },
      {
        id: 'ilsang',
        name: '일상',
        items: [
          { id: 'sago_ilsang', name: '사고', baseScore: 45 },
          { id: 'undong_ilsang', name: '운동', baseScore: 70 },
          { id: 'saeop_ilsang', name: '사업', baseScore: 65 },
          { id: 'gajok_ilsang', name: '가족', baseScore: 72 },
          { id: 'isa_ilsang', name: '이사', baseScore: 58 },
          { id: 'geongang_ilsang', name: '건강', baseScore: 70 },
          { id: 'jonggyo_ilsang', name: '종교', baseScore: 55 },
          { id: 'hageop_ilsang', name: '학업', baseScore: 68 },
          { id: 'bongsa', name: '봉사', baseScore: 65 },
          { id: 'yeonae_ilsang', name: '연애', baseScore: 70 },
          { id: 'jaemul_ilsang', name: '재물', baseScore: 62 }
        ]
      },
      {
        id: 'jayeongeop',
        name: '자영업',
        items: [
          { id: 'gwanri_jayeong', name: '관리', baseScore: 68 },
          { id: 'sangdam_jayeong', name: '상담', baseScore: 65 },
          { id: 'gumae_jayeong', name: '구매', baseScore: 62 },
          { id: 'segeum_jayeong', name: '세금', baseScore: 55 },
          { id: 'yeongop_jayeong', name: '영업', baseScore: 70 },
          { id: 'gyeyak_jayeong', name: '계약', baseScore: 68 },
          { id: 'dansok_jayeong', name: '단속', baseScore: 50 },
          { id: 'napum', name: '납품', baseScore: 65 },
          { id: 'yeyak', name: '예약', baseScore: 62 },
          { id: 'jaego', name: '재고', baseScore: 60 },
          { id: 'chaeyong', name: '채용', baseScore: 65 },
          { id: 'chinjeol', name: '친절', baseScore: 72 }
        ]
      },
      {
        id: 'jaeneung',
        name: '재능',
        items: [
          { id: 'undong_jaeneung', name: '운동', baseScore: 68 },
          { id: 'gisul_jaeneung', name: '기술', baseScore: 70 },
          { id: 'misul_jaeneung', name: '미술', baseScore: 65 },
          { id: 'eumak_jaeneung', name: '음악', baseScore: 68 },
          { id: 'jejak_jaeneung', name: '제작', baseScore: 65 },
          { id: 'gyesan_jaeneung', name: '계산', baseScore: 70 },
          { id: 'hageop_jaeneung', name: '학업', baseScore: 72 },
          { id: 'dokseo', name: '독서', baseScore: 70 },
          { id: 'deutgi', name: '듣기', baseScore: 68 },
          { id: 'malhagi', name: '말하기', baseScore: 70 },
          { id: 'sseugi', name: '쓰기', baseScore: 68 },
          { id: 'oegugeo', name: '외국어', baseScore: 65 }
        ]
      },
      {
        id: 'jeongchi',
        name: '정치',
        items: [
          { id: 'jageum_jeongchi', name: '자금', baseScore: 60 },
          { id: 'gyeyak_jeongchi', name: '계약', baseScore: 62 },
          { id: 'moim_jeongchi', name: '모임', baseScore: 65 },
          { id: 'geongang_jeongchi', name: '건강', baseScore: 68 },
          { id: 'bunjaeng_jeongchi', name: '분쟁', baseScore: 50 },
          { id: 'gyeoljeong', name: '결정', baseScore: 70 },
          { id: 'gwonryeok', name: '권력', baseScore: 65 },
          { id: 'myeonggye', name: '명예', baseScore: 68 },
          { id: 'balpyo', name: '발표', baseScore: 65 },
          { id: 'jeongchaek', name: '정책', baseScore: 70 },
          { id: 'julma', name: '줄마', baseScore: 55 },
          { id: 'huwon', name: '후원', baseScore: 62 }
        ]
      },
      {
        id: 'jikjang',
        name: '직장',
        items: [
          { id: 'keondisyeon_jikjang', name: '컨디션', baseScore: 70 },
          { id: 'tuja_jikjang', name: '투자', baseScore: 60 },
          { id: 'gaebal_jikjang', name: '개발', baseScore: 72 },
          { id: 'moim_jikjang', name: '모임', baseScore: 65 },
          { id: 'geongang_jikjang', name: '건강', baseScore: 68 },
          { id: 'hogam_jikjang', name: '호감', baseScore: 70 },
          { id: 'balpyo_jikjang', name: '발표', baseScore: 65 },
          { id: 'gyeoljae', name: '결재', baseScore: 68 },
          { id: 'bogoseo', name: '보고서', baseScore: 65 },
          { id: 'siljeok', name: '실적', baseScore: 70 },
          { id: 'jeopdae', name: '접대', baseScore: 62 },
          { id: 'jingeup', name: '진급', baseScore: 68 }
        ]
      },
      {
        id: 'chieop',
        name: '취업',
        items: [
          { id: 'keondisyeon_chieop', name: '컨디션', baseScore: 70 },
          { id: 'gisul_chieop', name: '기술', baseScore: 72 },
          { id: 'gaebal_chieop', name: '개발', baseScore: 70 },
          { id: 'gyeyak_chieop', name: '계약', baseScore: 65 },
          { id: 'geongang_chieop', name: '건강', baseScore: 68 },
          { id: 'siheom_chieop', name: '시험', baseScore: 70 },
          { id: 'balpyo_chieop', name: '발표', baseScore: 65 },
          { id: 'geunsim', name: '근심', baseScore: 50 },
          { id: 'myeonjeop', name: '면접', baseScore: 68 },
          { id: 'jeongong', name: '전공', baseScore: 72 },
          { id: 'chucheon', name: '추천', baseScore: 65 },
          { id: 'chieop_item', name: '취업', baseScore: 70 }
        ]
      },
      {
        id: 'chimi_jusaeng',
        name: '취미',
        items: [
          { id: 'undong_chimi', name: '운동', baseScore: 70 },
          { id: 'eumsik_chimi', name: '음식', baseScore: 68 },
          { id: 'geim_chimi', name: '게임', baseScore: 65 },
          { id: 'misul_chimi', name: '미술', baseScore: 65 },
          { id: 'eumak_chimi', name: '음악', baseScore: 70 },
          { id: 'jejak_chimi', name: '제작', baseScore: 62 },
          { id: 'moim_chimi', name: '모임', baseScore: 68 },
          { id: 'syoping_chimi', name: '쇼핑', baseScore: 65 },
          { id: 'yeohaeng_chimi', name: '여행', baseScore: 75 },
          { id: 'gwanram_chimi', name: '관람', baseScore: 68 },
          { id: 'bongsa_chimi', name: '봉사', baseScore: 62 },
          { id: 'dokseo_chimi', name: '독서', baseScore: 70 },
          { id: 'gongye', name: '공예', baseScore: 65 },
          { id: 'daenseu', name: '댄스', baseScore: 68 }
        ]
      },
      {
        id: 'haksaeng',
        name: '학생',
        items: [
          { id: 'iseong_haksaeng', name: '이성', baseScore: 65 },
          { id: 'gajok_haksaeng', name: '가족', baseScore: 70 },
          { id: 'seuseung', name: '스승', baseScore: 72 },
          { id: 'chingu_haksaeng', name: '친구', baseScore: 68 },
          { id: 'moim_haksaeng', name: '모임', baseScore: 65 },
          { id: 'geongang_haksaeng', name: '건강', baseScore: 68 },
          { id: 'oemo_haksaeng', name: '외모', baseScore: 62 },
          { id: 'siheom_haksaeng', name: '시험', baseScore: 70 },
          { id: 'ibyeol_haksaeng', name: '이별', baseScore: 45 },
          { id: 'hageop_haksaeng', name: '학업', baseScore: 72 },
          { id: 'balpyo_haksaeng', name: '발표', baseScore: 65 },
          { id: 'geunsim_haksaeng', name: '근심', baseScore: 50 }
        ]
      }
    ]
  },

  // 8. 주능 (새로 추가 - 중항목은 나중에 추가 예정)
  {
    id: 'juneung',
    name: '주능',
    icon: '⚡',
    description: '능력과 잠재력 분석',
    subcategories: []
  },

  // 9. 주흉 (새로 추가 - 중항목은 나중에 추가 예정)
  {
    id: 'juhyung',
    name: '주흉',
    icon: '⚠️',
    description: '위험과 주의사항 분석',
    subcategories: []
  }
]