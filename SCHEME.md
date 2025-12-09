# 🦝 NugulForm Chrome Extension – 기능 기획서 (v1.0)

## 1. 개요

NugulForm은 Google Forms 작성 시 반복적으로 입력해야 하는 사용자 정보를 자동으로 기입해주는 Chrome Extension이다.
Options 페이지에서 트위터/텔레그램/지갑 주소 등 개인 정보를 저장하면, Google Form 접속 시 자동 채우기 기능을 통해 손쉽게 기입할 수 있다.

지원 사이트:

* `https://docs.google.com/forms/*` (Google Forms 전용)

---

## 2. 동작 상태

### 2.1 Active / Disabled 상태 정의

| 상태           | 설명                  | UI 요소                               |
| ------------ | ------------------- | ----------------------------------- |
| **Active**   | Google Forms 페이지일 때 | Active 로고, 자동 채우기(Fixed) 버튼         |
| **Disabled** | 비지원 페이지일 때          | Disabled 로고, Options UI로만 구성된 popup |

### 2.2 표시 규칙

* Active: 자동 채우기 버튼이 우측 하단 fixed 형태로 표시됨
* Disabled: 자동 채우기 버튼 표시 없음
* Popup 화면도 상태에 따라 달라짐

  * Active → 기입 상태/미기입 상태 UI
  * Disabled → config 항목만 보이는 기본 Options 형태

---

## 3. Config (Options 페이지 구성)

### 3.1 저장 항목

모든 정보는 Chrome Storage API를 사용하여 브라우저에 저장된다.

**기입 가능한 항목:**

* Telegram Handle
* Twitter Handle
* Google 계정
* Wallet Address (EVM, Sol 등 확장 가능)
* YouTube
* 전화번호
* 기타 사용자 정의 입력값(추후 확장)

각 항목 공통 기능:

* 수정 가능
* Clipboard 복사 버튼 제공

### 3.2 옵션 설정

#### ✔ Positive 옵션 자동 선택

* On/Off
* 예 / 네 / Yes / Y / OK 등 긍정 선택지를 자동으로 클릭

#### ✔ Fallback 옵션 (첫 번째 선택지 자동 선택)

* On/Off
* Positive 선택 실패 시 첫 번째 선택지를 자동 선택

#### ✔ 자동 채우기 버튼 표시 설정

* On/Off
* 꺼진 경우 Popup 내부 "입력하기" 버튼만 사용

---

## 4. 주요 기능

### 4.1 Active 상태 (Google Forms)

#### 4.1.1 자동 채우기 버튼 (플로팅 버튼)

**위치 및 표시:**
* 우측 하단 Fixed UI (z-index: 9999)
* Google Forms 페이지에서만 표시
* 자동 채우기 버튼 표시 설정이 On인 경우에만 표시

**Normal 상태 (기본):**
* 파란색 원형 버튼 (bg-blue-600)
* 마법 지팡이 아이콘 (Wand2) 표시
* 호버 시 확대 애니메이션 (scale-110)
* 클릭 시:
  1. 저장된 Config 기반으로 Input 매칭
  2. 자동 기입 처리 실행
  3. 버튼 상태가 "기입 완료" 상태로 변경

**Filled 상태 (기입 완료):**
* 초록색 원형 버튼 (bg-green-600)
* 체크 아이콘 (Check) 표시
* 호버 시 "기입 완료" 툴팁 표시 (500ms 딜레이)
* 클릭 시 미기입 필드 Popover 표시

**Popover 내용:**
* 헤더: "기입 결과 확인"
* 안내 문구: "다음 필드가 누락되었습니다:"
* 미기입 필드 목록:
  * 각 필드별:
    * 필드 라벨 표시
    * 복사 버튼 (클립보드에 값 복사)
    * "바로 기입" 버튼 (해당 Input에 직접 기입)
* 푸터: "Popup에서 보기" 링크 (클릭 시 Popup 열기)

#### 4.1.2 자동 채우기 버튼이 비활성인 경우

* Popup 화면에서 "입력하기" 버튼으로 동일 기능 지원
* 기입 이후 동일하게 "기입 완료" UI 표시

---

### 4.2 Disabled 상태

* Popup에서 Options UI만 노출
* 기입되지 않은 Config 수정만 가능
* 자동 기입 기능 지원 X

---

### 4.3 기입 완료 상태 (Filled Mode)

자동 기입 처리 이후, 다음 기능 제공:

#### 4.3.1 자동 채우기 버튼 클릭 시 Popover 표시

* 표시 내용:

  * 미기입 항목 리스트
  * "빠뜨린 항목이 있나요?" 문구
  * 각 항목별:

    * Clipboard 복사 기능
    * 해당 Input에 바로 기입(INLINE FILL) 기능

#### 4.3.2 Popup UI도 동일 모드로 전환

* Popup에서도 미기입 정보 리스트 표시
* 동일하게 복사 및 바로기입 기능 제공

---

## 5. Parsing 엔진 설계

### 5.1 요구사항

Google Form의 문구가 제각각이기 때문에 다양한 variation을 처리하는 유연한 Parsing 엔진 필요.

### 5.2 매칭 규칙

1. **Label 전처리**

   * 소문자 변환
   * 공백/특수문자 제거

2. **Mapping Dictionary 기반 매칭**

   ```js
   telegram: ["tele", "telegram", "tg", "telegram handle", ...]
   twitter: ["twitter", "twit", "x handle", "twitter id", ...]
   ```

3. **부분 문자열 매칭**

   * includes / startsWith

4. **Fuzzy 매칭 적용**

   * Levenshtein distance 기반
   * 특정 점수 이상이면 매칭 확정

5. **스코어 기반 최종 결정**

   * 완전 일치 > 부분 일치 > fuzzy 순서

---

## 6. 문제 해결 전략

### 6.1 파싱 실패 케이스 개선 방안

#### ✔ 사용자 커스텀 매핑 지원

* "Label → 필드 매칭"을 사용자 정의로 저장
* 이후 동일 패턴 자동 적용

#### ✔ Placeholder 기반 추론

* Label이 없거나 비정상인 경우 placeholder 문구 분석

#### ✔ 폼 히스토리 학습

* 유사 폼에서의 매칭 기록을 기반으로 패턴 개선

---

### 6.2 확장되지 않은 정보 처리 방안

#### ✔ 사용자 정의(Custom) 필드 추가

* 옵션 페이지에서 필드 이름 + 값 추가 가능

#### ✔ Dynamic Field Detection

* 사용자가 특정 폼의 input을 "자동 입력 대상"으로 지정할 수 있도록 지원

#### ✔ AI 기반 필드 추론(차기 버전)

* 폼 전체 텍스트 분석해 어떤 값이 필요한지 추론 후 추천

---

## 7. UX / 기술 고려사항

### ✔ 오입력 방지

* 기입 완료 시 상태 아이콘 노출
* 필요 시 제출 전 검토 팝업 제공 가능

### ✔ UI 충돌 방지

* Google Forms UI와 겹치지 않는 fixed 위치
* z-index 조정

### ✔ 다국어/다플랫폼 확장성

* 초기: 한국어/영어
* 추후 Label 패턴 확장 가능

---

## 8. 전체 구조도

```
NugulForm Extension
├── Content Script
│   ├── 지원 사이트 감지
│   ├── Parsing 엔진
│   ├── 자동 기입 로직
│   └── Floating Button UI
│
├── Background
│   ├── Storage 핸들링
│   └── 메시지 패싱
│
├── Popup
│   ├── Config 페이지 (기본)
│   ├── 기입완료 모드
│   └── 입력하기 버튼
│
└── Options Page
    ├── 정보 입력/수정
    ├── 복사/편집 기능
    └── 자동 응답 옵션
```
