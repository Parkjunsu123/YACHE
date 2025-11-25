# Firebase 연동 가이드

## 1단계: Firebase 프로젝트 생성

### 1.1 Firebase 콘솔 접속
1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. Google 계정으로 로그인

### 1.2 프로젝트 생성
1. "프로젝트 추가" 또는 "Add project" 클릭
2. 프로젝트 이름 입력 (예: `yache-app`)
3. Google Analytics 설정 (선택사항)
4. "프로젝트 만들기" 클릭

### 1.3 웹 앱 등록
1. 프로젝트 대시보드에서 `</>` (웹) 아이콘 클릭
2. 앱 닉네임 입력 (예: `yache-web`)
3. "Firebase Hosting도 설정" 체크 해제 (선택사항)
4. "앱 등록" 클릭

### 1.4 Firebase 설정 정보 복사
등록 후 나타나는 Firebase 설정 정보를 복사합니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

**⚠️ 중요**: 이 정보는 `.env.local` 파일에 저장해야 합니다 (보안).

## 2단계: Firestore 데이터베이스 설정

### 2.1 Firestore 데이터베이스 생성
1. Firebase 콘솔에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. **프로덕션 모드** 또는 **테스트 모드** 선택
   - **테스트 모드**: 개발 중에는 테스트 모드 권장 (30일간 자유롭게 읽기/쓰기)
   - **프로덕션 모드**: 보안 규칙 설정 필요
4. 위치 선택 (예: `asia-northeast3` - 서울)
5. "사용 설정" 클릭

### 2.2 보안 규칙 설정 (프로덕션 모드인 경우)
Firestore > 규칙 탭에서 다음 규칙 설정:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 모든 사용자가 읽기/쓰기 가능 (개발용)
    match /{document=**} {
      allow read, write: if true;
    }
    
    // 또는 인증된 사용자만 허용
    // match /{document=**} {
    //   allow read, write: if request.auth != null;
    // }
  }
}
```

## 3단계: 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 Firebase 설정 정보를 입력:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**⚠️ 주의사항**:
- `.env.local` 파일은 `.gitignore`에 포함되어 있어야 합니다
- 환경 변수는 `REACT_APP_` 접두사가 필요합니다
- 설정 후 서버를 재시작해야 합니다

## 4단계: 사용 방법

### 데이터 저장 예시
```javascript
import { addMutualCheckToFirestore } from './utils/firestore';

const data = {
  platform: '카이토',
  project: { name: 'TRIA', ticker: 'TRIA' },
  link: 'https://example.com'
};

await addMutualCheckToFirestore(data);
```

### 데이터 조회 예시
```javascript
import { getMutualChecksFromFirestore } from './utils/firestore';

const items = await getMutualChecksFromFirestore();
```

## 5단계: Firebase 콘솔에서 데이터 확인

1. Firebase 콘솔 > Firestore Database
2. "데이터" 탭에서 저장된 데이터 확인
3. 컬렉션과 문서 구조 확인

## 문제 해결

### 오류: "Firebase: Error (auth/unauthorized-domain)"
- Firebase 콘솔 > Authentication > 설정 > 승인된 도메인에 현재 도메인 추가

### 오류: "Missing or insufficient permissions"
- Firestore 보안 규칙 확인
- 테스트 모드로 변경하거나 규칙 수정

### 데이터가 보이지 않음
- Firebase 콘솔에서 데이터베이스 위치 확인
- 네트워크 탭에서 오류 확인

