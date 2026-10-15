# Day 27 — 반응형 웹게임 레이아웃

Date: 2026-10-15
Game URL: https://dungeon-forge-gilt.vercel.app/
Source: index.html
Save key unchanged: dungeon-forge-ui-v2

## 목적
이전 460–480px로 한정된 모바일 게임 UI를 유동 레이아웃으로 전환. 화면이 좁은 스마트폰, 일반/대형 스마트폰, 폴더블, 태블릿, 데스크톱을 하나의 코드로 대응. 게임 기능 및 수익화 상태는 변경하지 않음.

## 반응형 구간
- <=359px: 작은 스마트폰. 재화 칩과 헤더 최소화, 장비 도감 3열, 전투/메뉴 높이 축소.
- 360–599px: 일반 스마트폰/커다란 폰. 전투 영역 214px~290px 동적 조절, 가방·도감 3열, 고정 하단 메뉴.
- 600–899px: 넓은 폰/폴더블 펼침/태블릿. 콘텐츠 최대 760px, 도감·가방 4열, 단조/강화 목록 3열.
- >=900px: 태블릿 가로/PC. 콘텐츠 최대 920px, 가방·도감 5열, 대장간 목록 4열, 상점 3열.
- 가로 방향 + 높이 <=550px: 짧은 가로 화면에서 전투/버튼/상단 타이틀 컴팩트화.
- 모든 구간에서 safe-area-inset-* (노치/홈바), dynamic viewport units, reduced motion 선호도 보존.

## 구현
- 고정 폭 및 네비게이션 너비를 CSS 커스텀 속성·반응형 max-width로 변경.
- battle viewport-based fluid arena, 캐릭터 크기 및 sticky battle buttons/nav 간격 조절.
- 장비/도감/대장간/상점 그리드를 minmax와 auto-fit으로 화면 폭에 맞게 재배치.
- 작은 화면에서 리소스 칩과 헤더 줄어듦, nav 버튼 44px 이상.
- 강화/획득 팝업은 현재 viewport 높이 내에서 스크롤 가능하게 조절.
- 스크롤 overflow 방지 및 긴 아이템 명칭 줄바꿈 처리.
- HTML/JS와 저장 시스템, 확률·전투 밸런스/과금 기능 변경 없음.

## 검증
- 13/13 mocked-DOM 기능 및 코드 검사 통과 (5개 화면, viewport/safe area, 폭별 브레이크포인트, 가로 모드, 모달 높이, 반응형 목록, 신규 이용자 전투→제작→장착, 기존 저장키).
- Browser real-device visual/screenshot test **not completed**: build environment could not resolve deployed domain and no integrated browser QA provider is available. This must be done on iPhone/Android and tablet before public app launch.

## 권장 실기기 확인
320x568, 360x800, 375x812, 390x844, 430x932, 600x960, 768x1024, 1024x768 and short landscape 667x375. Check horizontal scroll absence, modal button reachability, safe-area menu, combat sticky skill bar, item grid and app state after rotating device.
