<div align="center">

# 🦝 너굴폼 (NugulForm)

**폐지줍기는 너굴맨이 처리했으니 안심하라구!**

</div>

## 📖 소개

너굴폼(NugulForm)은 Chrome/Firefox 확장 프로그램입니다.

## 🚀 시작하기

### 요구사항

- Node.js >= 22.15.1
- pnpm 10.11.0

### 설치

```bash
# pnpm 설치 (없는 경우)
npm install -g pnpm

# 의존성 설치
pnpm install
```

### 개발

```bash
# Chrome 개발 모드
pnpm dev

# Firefox 개발 모드
pnpm dev:firefox
```

### 빌드

```bash
# Chrome 프로덕션 빌드
pnpm build

# Firefox 프로덕션 빌드
pnpm build:firefox

# ZIP 파일 생성
pnpm zip
```

### 확장 프로그램 로드

#### Chrome

1. `chrome://extensions` 접속
2. 개발자 모드 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `dist` 폴더 선택

#### Firefox

1. `about:debugging#/runtime/this-firefox` 접속
2. "임시 부가 기능 로드" 클릭
3. `dist/manifest.json` 파일 선택

## 📁 프로젝트 구조

```
├── chrome-extension/     # 확장 프로그램 설정 (manifest, background)
├── pages/
│   ├── content/          # 페이지에 주입되는 스크립트
│   ├── content-ui/       # 페이지에 주입되는 React UI
│   ├── content-runtime/  # 런타임 주입 스크립트
│   ├── popup/            # 팝업 UI
│   ├── options/          # 옵션 페이지
│   ├── side-panel/       # 사이드 패널
│   └── devtools*/        # 개발자 도구
├── packages/
│   ├── env/              # 환경 변수
│   ├── i18n/             # 다국어 지원
│   ├── shared/           # 공유 유틸리티
│   ├── storage/          # 스토리지 헬퍼
│   ├── ui/               # UI 컴포넌트
│   └── ...
└── tests/                # E2E 테스트
```

## 🔧 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | Chrome 개발 서버 시작 |
| `pnpm dev:firefox` | Firefox 개발 서버 시작 |
| `pnpm build` | Chrome 프로덕션 빌드 |
| `pnpm build:firefox` | Firefox 프로덕션 빌드 |
| `pnpm zip` | 배포용 ZIP 생성 |
| `pnpm lint` | 린트 검사 |
| `pnpm lint:fix` | 린트 자동 수정 |
| `pnpm type-check` | 타입 검사 |
| `pnpm e2e` | E2E 테스트 실행 |
| `pnpm update-version <version>` | 버전 업데이트 |
| `pnpm module-manager` | 모듈 활성화/비활성화 |

## 🌐 다국어 지원

`packages/i18n/locales/` 폴더에서 다국어 메시지를 관리합니다.

- `ko/messages.json` - 한국어
- `en/messages.json` - 영어

## 🚢 배포

프로젝트는 GitHub Actions를 통해 자동 배포를 지원합니다.

### 자동 배포 워크플로우

1. **버전 릴리즈 워크플로우** - 버전 관리 및 자동 배포 트리거
2. **Chrome Web Store 배포** - Chrome 확장 프로그램 자동 배포
3. **Firefox Add-ons 배포** - Firefox 확장 프로그램 자동 배포

### 배포 방법

#### 방법 1: GitHub Actions에서 수동 실행 (권장)

1. GitHub 저장소의 **Actions** 탭으로 이동
2. **Version Release Workflow** 선택
3. **Run workflow** 클릭
4. 새 버전 입력 (예: `1.0.0`)
5. **Run workflow** 클릭

이렇게 하면 자동으로:
- 모든 `package.json` 파일의 버전 업데이트
- Git 태그 생성
- GitHub 릴리즈 생성
- Chrome 및 Firefox 배포 자동 트리거

#### 방법 2: Git 태그로 트리거

```bash
# 로컬에서 태그 생성 및 푸시
git tag v1.0.0
git push origin v1.0.0
```

### 필요한 GitHub Secrets

배포를 위해 다음 시크릿을 설정해야 합니다:

**Chrome Web Store:**
- `CHROME_EXTENSION_ID`
- `CHROME_CLIENT_ID`
- `CHROME_CLIENT_SECRET`
- `CHROME_REFRESH_TOKEN`

**Firefox Add-ons:**
- `FIREFOX_EXTENSION_ID`
- `FIREFOX_API_KEY`
- `FIREFOX_API_SECRET`

자세한 설정 방법은 [배포 가이드](.github/DEPLOYMENT.md)를 참고하세요.

## 📝 라이선스

MIT License

---

Based on [chrome-extension-boilerplate-react-vite](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite)
