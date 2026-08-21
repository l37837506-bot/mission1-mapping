# 미션 1 · 정찰 매핑 앱

서울로봇인공지능과학관 극한환경 탐사 미션 — 미션 1(바퀴형 로봇 정찰)의
데이터 매핑 웹앱. 5팀이 태블릿으로 각 구역 데이터를 입력하면 실시간
동기화되고, 강사 화면에서 히트맵으로 볼 수 있음.

> 프로젝트 전체 맥락은 `PROJECT_CONTEXT.md` 참고.

---

## 파일

| 파일 | 설명 |
|---|---|
| `index.html` | 실배포용 완성본 (이것만 배포하면 됨) |
| `mission1_mapping_app.jsx` | Claude 아티팩트용 React 원본 (참고용) |
| `PROJECT_CONTEXT.md` | 프로젝트 전체 맥락 & 진행 상황 |

---

## 빠른 실행 (로컬 테스트)

`index.html`은 CDN 의존성만 있어서 브라우저로 바로 열면 됨.
단, Firebase 저장을 테스트하려면 인터넷 연결 + DB 규칙 설정 필요.

```bash
# 로컬 서버로 열기 (선택)
python3 -m http.server 8000
# → http://localhost:8000
```

URL 라우팅:
- 홈: `http://localhost:8000/#/`
- 팀: `http://localhost:8000/#/team/1`
- 강사: `http://localhost:8000/#/admin`

---

## 설정값 (index.html 상단 `<script>` 내)

```javascript
const DATABASE_URL = 'https://mission1-mapping-default-rtdb.firebaseio.com';
const DB_PATH = 'mission1_v1';
const POLL_INTERVAL = 3000;  // 데이터 갱신 주기(ms)
```

---

## Firebase 규칙 (필수)

Realtime Database → 규칙:

```json
{
  "rules": {
    "mission1_v1": {
      ".read": true,
      ".write": true
    }
  }
}
```

---

## 배포 (GitHub Pages)

1. `mission1-mapping` 저장소 생성 (Public)
2. `index.html` 업로드
3. Settings → Pages → `main` / `(root)` → Save
4. URL: `https://137837506-bot.github.io/mission1-mapping/`

### 태블릿 배정
| 기기 | URL |
|---|---|
| 1~5팀 | `.../mission1-mapping/#/team/1` ~ `/team/5` |
| 강사 | `.../mission1-mapping/#/admin` |

---

## 데이터 구조 (Firebase)

```
mission1_v1/
  {teamId}/           # 1~5
    {zoneCode}/       # α1, α2, ... δ3
      radiation: "3.5"
      temp: "45"
      humidity: "60"
      bridge: false
      capsule: false
      timestamp: 1234567890
```

---

## 향후 개선 아이디어

- CSV 내보내기 (수업 후 활동지 정리용)
- 미션 타이머
- 구역 핀 위치 실측 대조 후 미세 조정
- 미션 2·3 앱과 통합 대시보드
