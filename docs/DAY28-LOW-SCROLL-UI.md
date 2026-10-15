# Day 28 — 최소 스크롤 UX 재구성

Date: 2026-10-15
Game: https://dungeon-forge-gilt.vercel.app/
Save key: `dungeon-forge-ui-v2` (unchanged)

## 목표
다양한 기종에서 손가락으로 긴 페이지를 반복해서 내려야 하는 문제를 줄이고, 조작 및 필요한 정보만 전면에 보여준다. 전투는 우선적으로 한 화면에 들어오도록 화면 밀도를 조정하되, 매우 작은 디스플레이나 많은 정보가 있는 화면에서는 콘텐츠 유실 없이 내부 스크롤을 허용한다.

## 주요 구현
- 문서 전체 스크롤 잠금: body 고정, #app 전체 높이를 dynamic viewport(100dvh)에 맞춤. 하단 내비게이션은 고정.
- 화면 콘텐츠 영역 #screen은 남은 높이만 차지하며, 필요시 **그 영역 내부에서만** 스크롤. 노치/홈 표시용 env(safe-area-inset-bottom) 반영.
- 던전 UI를 전투 / 보상·제작 두 개의 서브 탭으로 분리. 처음 진입하거나 던전 메인 메뉴로 복귀하면 전투 탭이 보임. 화면 아래 길게 나열되던 임무·출석·지역 제작이 보상·제작 탭에 들어감.
- 전투 UI는 기존 몬스터·체력 표시·스킬 버튼·자동/수동 전환 유지. 모바일 전투 필드 높이는 viewport에 따라 압축, 공격 버튼은 전투 카드 아래에 배치.
- 목록이 많아지는 장비·창고·도감·제련 장비 목록은 개별 최대 높이를 정하고 목록 안에서 스크롤. 외부 스크롤도 콘텐츠 접근성을 위해 필요한 경우만 허용.
- 메뉴 변경 시 #screen 내부 스크롤 위치를 0으로 초기화; 던전으로 다시 들어올 때 전투 탭 복원.
- 기존 새 이용자 튜토리얼, 제작/보스/보상, 저장 데이터 및 유료 결제 준비 상태 변경 없음.

## 자동 점검
11/11 JS/DOM smoke checks passed:
1. JS and five primary screens.
2. Dungeon default combat and tasks switching.
3. Combat restored on return to dungeon.
4. Scroll position reset on tab navigation.
5. Quest and reward controls remain accessible.
6. Beginner fight-to-equip onboarding.
7. Body scroll locked with internal #screen scroll.
8. Inventory and forge internal scroll.
9. Existing save key.
10. Existing player progression/gear compatibility.

## 제약
실제 스마트폰 화면 캡처와 UI 터치 테스트를 수행한 것은 아니다. 기기별로 320x568, 360x800, 390x844, 430x932, 태블릿 세로/가로, 가로 모드를 확인해야 한다. 특히 모바일 키보드가 표시될 때 장비 검색 입력 및 인벤토리 내 스크롤, 모달 스크롤의 상호작용은 추가 QA 대상.
