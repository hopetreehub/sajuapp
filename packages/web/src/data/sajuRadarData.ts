// 주문차트 PDF 기반 정확한 7개 대항목 데이터 구조
import { SajuRadarCategory } from '@/types/sajuRadar'

export const SAJU_RADAR_CATEGORIES: SajuRadarCategory[] = [
  {
    id: 'jubon',
    name: '주본',
    icon: '🎯',
    description: '근본본, 성향, 욕정, 주격 분석',
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
      }
    ]
  },
  {
    id: 'juun',
    name: '주운',
    icon: '🍀',
    description: '22개 운세 항목 분석',
    subcategories: [
      {
        id: 'jeonche',
        name: '전체',
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
  {
    id: 'noe',
    name: '뇌',
    icon: '🧠',
    description: '17개 뇌 부위 분석',
    subcategories: [
      {
        id: 'jeonche',
        name: '전체',
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
  {
    id: 'jugeon',
    name: '주건',
    icon: '💪',
    description: '비만, 심리, 인체계, 정력, 질환 분석',
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
      }
    ]
  },
  {
    id: 'juyeon',
    name: '주연',
    icon: '🤝',
    description: '외가, 이성, 인연, 선배, 친가, 친구, 후배 분석',
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
      }
    ]
  },
  {
    id: 'jujae',
    name: '주재',
    icon: '🎨',
    description: '논리, 예술, 학습, 능력, 성향, 투자 분석',
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
      },
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
        id: 'seonghyang_jujae',
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
        id: 'tuja',
        name: '투자',
        items: [
          { id: 'as', name: 'AS', baseScore: 60 },
          { id: 'tuja_item', name: '투자', baseScore: 55 }
        ]
      }
    ]
  },
  {
    id: 'jueop',
    name: '주업',
    icon: '💼',
    description: '업무, 업종, 직업 분석',
    subcategories: [
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
          // 매우 많은 직업들이 있지만 일부만 포함 (PDF에서 전체 목록 확인 필요)
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
  }
]