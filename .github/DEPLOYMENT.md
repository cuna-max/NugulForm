# 배포 가이드

이 문서는 NugulForm 브라우저 확장 프로그램의 배포 워크플로우를 설명합니다.

## 개요

프로젝트는 세 가지 GitHub Actions 워크플로우를 통해 자동 배포를 지원합니다:

1. **크롬 익스텐션 배포** (`deploy-chrome.yml`)
2. **파이어폭스 익스텐션 배포** (`deploy-firefox.yml`)
3. **버전 관리 및 릴리즈** (`version-release.yml`)

## 사전 준비

### 필요한 GitHub Secrets

다음 시크릿을 GitHub 저장소 설정에서 추가해야 합니다:

#### Chrome Web Store
- `CHROME_EXTENSION_ID`: Chrome Web Store의 확장 프로그램 ID
- `CHROME_CLIENT_ID`: Google OAuth 2.0 클라이언트 ID
- `CHROME_CLIENT_SECRET`: Google OAuth 2.0 클라이언트 시크릿
- `CHROME_REFRESH_TOKEN`: Chrome Web Store API용 리프레시 토큰

#### Firefox Add-ons
- `FIREFOX_EXTENSION_ID`: Firefox Add-ons의 확장 프로그램 ID (예: `nugulform@cuna-max.com`)
- `FIREFOX_API_KEY`: Firefox Add-ons API 키 (JWT issuer)
- `FIREFOX_API_SECRET`: Firefox Add-ons API 시크릿

### Chrome Web Store API 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. Chrome Web Store API 활성화
3. OAuth 2.0 클라이언트 ID 생성
4. 리프레시 토큰 생성:
   ```bash
   # 리프레시 토큰 생성 스크립트 참고
   # https://developer.chrome.com/docs/webstore/using_webstore_api
   ```

### Firefox Add-ons API 설정

1. [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)에 로그인
2. API 자격 증명 생성
3. API 키와 시크릿을 GitHub Secrets에 추가

## 워크플로우 사용 방법

### 1. 버전 관리 및 릴리즈 워크플로우

#### 방법 A: 수동 트리거 (권장)

1. GitHub Actions 탭으로 이동
2. "Version Release Workflow" 선택
3. "Run workflow" 클릭
4. 다음 정보 입력:
   - **version**: 새 버전 (예: `1.0.0`)
   - **create_release**: GitHub 릴리즈 생성 여부 (기본값: true)
5. "Run workflow" 클릭

이 워크플로우는:
- 모든 `package.json` 파일의 버전을 업데이트
- Git 태그 생성 (`v1.0.0` 형식)
- GitHub 릴리즈 생성
- Chrome 및 Firefox 배포 워크플로우 자동 트리거

#### 방법 B: Git 태그로 트리거

```bash
# 로컬에서 태그 생성 및 푸시
git tag v1.0.0
git push origin v1.0.0
```

태그가 푸시되면 자동으로:
- 버전 확인 및 업데이트
- GitHub 릴리즈 생성
- 배포 워크플로우 트리거

### 2. 크롬 익스텐션 배포

#### 자동 배포
- `version-release.yml` 워크플로우가 자동으로 트리거합니다.

#### 수동 배포
1. GitHub Actions 탭으로 이동
2. "Deploy Chrome Extension" 선택
3. "Run workflow" 클릭
4. 버전 입력 (예: `1.0.0`)
5. "Run workflow" 클릭

배포 프로세스:
1. 확장 프로그램 빌드
2. ZIP 파일 생성
3. Chrome Web Store에 업로드
4. 자동으로 게시 (publish)

### 3. 파이어폭스 익스텐션 배포

#### 자동 배포
- `version-release.yml` 워크플로우가 자동으로 트리거합니다.

#### 수동 배포
1. GitHub Actions 탭으로 이동
2. "Deploy Firefox Extension" 선택
3. "Run workflow" 클릭
4. 버전 입력 (예: `1.0.0`)
5. "Run workflow" 클릭

배포 프로세스:
1. Firefox용 확장 프로그램 빌드
2. XPI 파일 생성
3. `web-ext`를 사용하여 서명 및 제출
4. Firefox Add-ons에 자동 제출

## 배포 프로세스 흐름

```
버전 릴리즈 워크플로우
    ↓
버전 업데이트 + Git 태그 생성
    ↓
GitHub 릴리즈 생성
    ↓
┌─────────────────┬─────────────────┐
│                 │                 │
Chrome 배포      Firefox 배포
워크플로우        워크플로우
    │                 │
    ↓                 ↓
Chrome Web Store  Firefox Add-ons
```

## 버전 형식

버전은 [Semantic Versioning](https://semver.org/) 형식을 따릅니다:

- 형식: `MAJOR.MINOR.PATCH` (예: `1.0.0`)
- Git 태그: `v` 접두사 포함 (예: `v1.0.0`)

## 문제 해결

### Chrome Web Store 배포 실패

1. **인증 오류**: `CHROME_REFRESH_TOKEN`이 만료되었을 수 있습니다. 새로 생성하세요.
2. **업로드 실패**: ZIP 파일 크기나 형식을 확인하세요.
3. **게시 실패**: Chrome Web Store의 검토 상태를 확인하세요.

### Firefox Add-ons 배포 실패

1. **서명 실패**: `FIREFOX_API_KEY`와 `FIREFOX_API_SECRET`을 확인하세요.
2. **제출 실패**: `web-ext` 타임아웃이 발생할 수 있습니다. 워크플로우의 타임아웃 값을 조정하세요.
3. **확장 프로그램 ID 불일치**: `manifest.ts`의 `browser_specific_settings.gecko.id`와 시크릿의 `FIREFOX_EXTENSION_ID`가 일치하는지 확인하세요.

### 버전 업데이트 실패

1. **버전 형식 오류**: `X.Y.Z` 형식을 정확히 따르세요.
2. **Git 권한 오류**: `GITHUB_TOKEN` 권한을 확인하세요.
3. **태그 충돌**: 이미 존재하는 태그는 삭제 후 재생성됩니다.

## 모니터링

배포 상태는 GitHub Actions 탭에서 확인할 수 있습니다:

- ✅ 성공: 초록색 체크마크
- ❌ 실패: 빨간색 X 표시
- ⏳ 진행 중: 노란색 원

각 워크플로우의 로그를 확인하여 상세한 오류 정보를 확인할 수 있습니다.

## 참고 자료

- [Chrome Web Store API 문서](https://developer.chrome.com/docs/webstore/using_webstore_api)
- [Firefox Add-ons API 문서](https://addons-server.readthedocs.io/en/latest/topics/api/signing.html)
- [web-ext 도구 문서](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
