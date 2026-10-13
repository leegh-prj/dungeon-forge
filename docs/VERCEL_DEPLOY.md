# Vercel 자동 배포 안내

## 목적
`leegh-prj/dungeon-forge` GitHub 저장소의 `main` 브랜치를 Vercel에 연결하여, 커밋 시 자동으로 고정 URL의 게임을 배포한다.

## 최초 연결
1. Vercel 계정을 연결한다.
2. Vercel에서 **Add New → Project → Import Git Repository**를 선택한다.
3. GitHub 저장소 `leegh-prj/dungeon-forge`를 선택한다. 저장소가 없으면 Vercel GitHub 접근 권한을 확인한다.
4. Framework Preset = **Other**.
5. Root Directory = **./**.
6. Build Command = 비워둠, Output Directory = 비워둠 (프로젝트 루트에 index.html이 존재하는 정적 사이트).
7. Deploy를 클릭한다.
8. 배포 후 Vercel에서 발급된 **실제 프로덕션 URL**을 확인한다.

## 자동 배포
- `main`에 새 커밋이 반영되면 연결된 Vercel 프로젝트가 자동으로 새 프로덕션 배포를 시도한다.
- Pull Request/브랜치는 설정에 따라 미리보기 배포가 생성된다.
- 고정 주소를 사용하더라도 브라우저 캐시와 배포 처리에 약간의 지연이 있을 수 있다.

## 주의사항
- 현재 GitHub 원격에는 Day 8 로컬 패키지가 아직 합쳐지지 않았을 수 있다. Vercel은 GitHub에 올라온 코드만 배포한다.
- 최신 Day 8 화면 및 WebP가 필요하면 우선 로컬 패키지를 저장소에 커밋/푸시해야 한다.
- 기존 `index.html`와 `assets/art` 상대경로를 유지한다.
- 실제 Vercel 배포 성공/외부 접근 검증 전에는 서비스가 공개되었다고 표현하지 않는다.
