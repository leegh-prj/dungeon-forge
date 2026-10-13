# Day 8 — 그래픽 및 게임플레이 개선 (로컬 검증 버전)

## 구현 완료 (배포 패키지 준비)
- 승인된 모바일 RPG 화면을 기반으로 5개 탭 구조 유지
- 무기 / 갑옷 / 방패 / 반지별 6등급 **24개 WebP 아이콘**
- 제작 성공 결과 팝업, 등급 및 옵션 공개
- 보스 공격 예고, 방어 성공에 따른 광석 획득
- 몬스터·지역 도감 (물, 불, 번개, 독, 대지, 로봇)
- 기본 연동 테스트 `node test_day8.js`: 통과

## GitHub 적용 상태
현재 원격에는 이전 버전이 배포되어 있다. 위 신규 UI와 WebP 바이너리 파일은 이 문서만으로 원격에 업로드되지 않는다. 업데이트 ZIP을 로컬 저장소에 복사하고 push해야 한다.

## 설치 및 업로드
1. Day 8 ZIP을 다운로드 후 압축 해제.
2. 로컬 기존 Git 저장소의 프로젝트 폴더에서 우선 `git pull --ff-only origin main` 실행.
3. 새 패키지의 `index.html`, `assets/art`, `test_day8.js`, `docs-DAY8.md`를 기존 저장소에 복사.
4. 다음 실행:
```powershell
node test_day8.js
git add index.html assets/art test_day8.js docs-DAY8.md
git commit -m "Day 8: new UI art and gameplay improvements"
git push origin main
```
5. GitHub Actions에서 Pages 빌드 성공 확인 후 `https://leegh-prj.github.io/dungeon-forge/` 확인.

## 품질 검증 미완료
모바일 실기기, 화면 크기별 시각 QA, Godot 버전 이식.
