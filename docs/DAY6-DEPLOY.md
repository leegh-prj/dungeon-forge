# Day 6 — 그래픽 리소스 GitHub 반영 및 Pages 배포 준비

날짜: 2026-10-13

## 코드/에셋 변경
- 독립 실행 가능한 벡터 그래픽 8개 등록: hero, slime, magma, smith, dungeon, forge, weapons, shields.
- GitHub Pages 웹 프로젝트의 던전/대장간/장비/도감에 실제 이미지 경로 연결.
- 장면별 WebP를 우선 사용하고 파일이 없으면 저장소에 등록된 SVG를 사용.
- 전투·제작·재화·저장 로직은 유지.
- 속성 및 커스터마이징 데이터 설계는 [EXPANSION_ARCHITECTURE.md](EXPANSION_ARCHITECTURE.md) 참고.

## 배포
- 저장소: https://github.com/leegh-prj/dungeon-forge
- Pages 예정 URL: https://leegh-prj.github.io/dungeon-forge/
- Pages의 main / (root) 자동 배포 설정이 이미 활성화되어 있다면 새 커밋마다 웹사이트가 갱신된다.
- 여기서는 GitHub 저장소 파일 존재는 확인했으나 **외부 Pages URL과 실제 브라우저 렌더링을 확인하지 못했다**.

## 고해상도 원화 WebP 적용 (추가 필요)
기존 `dungeon-forge-art-assets.zip`에 있는 WebP 파일이 GitHub 저장소에 아직 없다. 이미지 업로드 전까지는 벡터 대체 이미지가 표시된다. WebP 패키지가 PC에 있다면:

1. ZIP을 풀고 `assets/art` 폴더를 기존 로컬 저장소의 동일 폴더로 복사.
2. 프로젝트 폴더 PowerShell에서:

```powershell
git pull --ff-only origin main
git add assets/art
git commit -m "Add high resolution Dungeon Forge art"
git push origin main
```

3. GitHub Pages를 새로고침하여 원화 WebP가 표시되는지 확인.

**주의:** 아트북에서 크롭한 WebP는 완성형 투명 스프라이트가 아니다. 원화 톤 확보를 위한 임시 2D 게임 에셋이며, 독립 프레임/애니메이션 제작이 후속 과제다.

## 다음 QA
- 360/390px 화면, 4개 탭, 이미지 로딩, 제작, 보스 방어 타이밍.
- WebP 유무에 따른 자동 폴백.
- 이미지의 잘림, 크기, 대비, 로딩 속도 점검.
