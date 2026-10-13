# GitHub 업로드 및 웹 플레이 공개 (Windows 기준)

## A. GitHub 저장소 만들기
1. https://github.com/new 접속 후 Repository name을 `dungeon-forge`로 입력합니다.
2. 코드를 비공개로 보관하려면 Private를 선택합니다. GitHub Pages 공개 웹주소가 필요하면 Public 저장소를 권장합니다.
3. **Add a README**, **Add .gitignore**, **Choose a license**는 모두 선택하지 않고 `Create repository`를 누릅니다.

## B. 소스 업로드 (Windows PowerShell)
1. 이 ZIP을 내려받아 압축을 풉니다.
2. 파일 탐색기에서 `dungeon-forge` 폴더를 열고, 주소 표시줄에 `powershell`을 입력합니다.
3. 컴퓨터에 Git이 설치되지 않았다면 https://git-scm.com/downloads/win 에서 설치합니다.
4. 아래 명령을 **한 줄씩** 실행합니다.

```powershell
git init
git branch -M main
git add .
git commit -m "Day 2: crafting focus, defense and web prototype"
git remote add origin https://github.com/leegh-prj/dungeon-forge.git
git push -u origin main
```

인증을 요청하면 GitHub 계정으로 로그인합니다. 암호를 직접 입력하는 대신 브라우저 인증 또는 Git Credential Manager를 사용합니다.

> `remote origin already exists`가 뜨면 `git remote set-url origin https://github.com/leegh-prj/dungeon-forge.git`을 실행합니다.
> `nothing to commit`은 변경 내역이 없을 때 정상입니다.

## C. 웹 플레이 주소 공개 (선택)
1. GitHub 저장소에서 `Settings → Pages`를 엽니다.
2. `Build and deployment` → `Deploy from a branch`를 선택합니다.
3. Branch를 `main`, Folder를 `/ (root)`로 선택해 저장합니다.
4. Pages가 활성화되면 대개 `https://leegh-prj.github.io/dungeon-forge/`에서 플레이합니다. 정확한 URL과 게시 완료 여부는 GitHub Pages 화면에서 확인하세요.
5. 공개 Pages로 게시한 게임 및 웹 코드에 타인이 접근할 수 있으니 비밀키를 넣지 마세요.

## D. Godot 실행
1. https://godotengine.org/download/windows/ 에서 Godot 4를 설치합니다.
2. Godot Project Manager의 `Import`를 눌러 `project.godot`을 선택합니다.
3. `F5`를 눌러 테스트합니다.
4. Android APK를 만들려면 Godot export templates와 Android SDK/JDK, 내보내기 설정이 필요합니다. iOS 네이티브 빌드는 macOS/Xcode가 필요합니다.

## 다음 변경 올리기
```powershell
git add .
git commit -m "Improve dungeon forge"
git push
```
