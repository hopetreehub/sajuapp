// 자동 점수 적용 스크립트
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 파일 읽기
const filePath = path.join(__dirname, '../data/sajuRadarData.ts');
let content = fs.readFileSync(filePath, 'utf8');

// baseScore: 숫자 패턴을 baseScore: getSajuScore('이름', 숫자)로 변경
content = content.replace(/{ id: '([^']+)', name: '([^']+)', baseScore: (\d+) }/g, 
  "{ id: '$1', name: '$2', baseScore: getSajuScore('$2', $3) }");

// 파일 쓰기
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ 사주 점수 계산 함수 적용 완료');