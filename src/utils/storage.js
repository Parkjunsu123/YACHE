// 쿠키 기반 스토리지 유틸리티

// 쿠키 설정
export const setCookie = (name, value, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};expires=${expires.toUTCString()};path=/`;
};

// 쿠키 가져오기
export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

// 쿠키 삭제
export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// 사용자 세션 관리
const USER_SESSION_KEY = 'yacheUserSession';

export const getUserSession = () => {
  return getCookie(USER_SESSION_KEY);
};

export const setUserSession = (session) => {
  setCookie(USER_SESSION_KEY, session);
};

export const clearUserSession = () => {
  deleteCookie(USER_SESSION_KEY);
};

// 기존 데이터를 새 구조로 마이그레이션
const migrateOldData = (data) => {
  if (!data || typeof data !== 'object') return {};
  
  const migratedData = {};
  
  for (const dateString in data) {
    const value = data[dateString];
    
    // 이미 배열이면 그대로 사용
    if (Array.isArray(value)) {
      migratedData[dateString] = value;
    } 
    // 객체면 배열로 변환 (기존 구조)
    else if (value && typeof value === 'object') {
      const id = Date.now() + Math.random();
      migratedData[dateString] = [{ ...value, id }];
    }
  }
  
  return migratedData;
};

// 일일 체크 데이터 추가 (배열로 관리)
export const addDailyCheckData = (dateString, data) => {
  const allData = getCookie('dailyCheckData') || {};
  
  // 데이터 마이그레이션
  const migratedData = migrateOldData(allData);
  
  // 해당 날짜의 배열이 없으면 생성
  if (!migratedData[dateString]) {
    migratedData[dateString] = [];
  }
  
  // 배열인지 확인 (안전 장치)
  if (!Array.isArray(migratedData[dateString])) {
    migratedData[dateString] = [];
  }
  
  // 고유 ID 생성
  const id = Date.now() + Math.random();
  const newData = { ...data, id };
  
  // 배열에 추가
  migratedData[dateString].push(newData);
  setCookie('dailyCheckData', migratedData);
  
  return newData;
};

// 일일 체크 데이터 가져오기 (배열)
export const getDailyCheckData = (dateString) => {
  const allData = getCookie('dailyCheckData') || {};
  const migratedData = migrateOldData(allData);
  return migratedData[dateString] || [];
};

// 모든 일일 체크 데이터 가져오기
export const getAllDailyCheckData = () => {
  const allData = getCookie('dailyCheckData') || {};
  return migrateOldData(allData);
};

// 특정 항목 삭제 (ID로)
export const deleteDailyCheckItem = (dateString, itemId) => {
  const allData = getCookie('dailyCheckData') || {};
  const migratedData = migrateOldData(allData);
  
  if (migratedData[dateString] && Array.isArray(migratedData[dateString])) {
    migratedData[dateString] = migratedData[dateString].filter(item => item.id !== itemId);
    
    // 배열이 비었으면 날짜 자체를 삭제
    if (migratedData[dateString].length === 0) {
      delete migratedData[dateString];
    }
    
    setCookie('dailyCheckData', migratedData);
  }
};

// 특정 날짜의 모든 데이터 삭제
export const deleteDateData = (dateString) => {
  const allData = getCookie('dailyCheckData') || {};
  const migratedData = migrateOldData(allData);
  delete migratedData[dateString];
  setCookie('dailyCheckData', migratedData);
};

// 모든 데이터 삭제
export const clearAllDailyCheckData = () => {
  deleteCookie('dailyCheckData');
};

// 기존 쿠키 데이터 초기화 (필요시 사용)
export const resetCookieData = () => {
  deleteCookie('dailyCheckData');
  console.log('쿠키 데이터가 초기화되었습니다.');
};

// 즐겨찾기 관련 함수들
// 즐겨찾기 데이터 구조: { "카이토": ["TRIA", "IRYS"], "쿠키": ["SUPERFORM"] }

// 즐겨찾기 가져오기
export const getFavorites = () => {
  return getCookie('projectFavorites') || {};
};

// 특정 플랫폼의 즐겨찾기 가져오기
export const getPlatformFavorites = (platform) => {
  const favorites = getFavorites();
  return favorites[platform] || [];
};

// 즐겨찾기 토글
export const toggleFavorite = (platform, ticker) => {
  const favorites = getFavorites();
  
  if (!favorites[platform]) {
    favorites[platform] = [];
  }
  
  const index = favorites[platform].indexOf(ticker);
  
  if (index > -1) {
    // 이미 즐겨찾기에 있으면 제거
    favorites[platform].splice(index, 1);
  } else {
    // 없으면 추가
    favorites[platform].push(ticker);
  }
  
  setCookie('projectFavorites', favorites);
  return favorites[platform];
};

// 즐겨찾기 확인
export const isFavorite = (platform, ticker) => {
  const favorites = getPlatformFavorites(platform);
  return favorites.includes(ticker);
};

// 상호체크 데이터 관련 함수들
// 상호체크 데이터 추가
export const addMutualCheckData = (data) => {
  const allData = getCookie('mutualCheckData') || [];
  
  // 고유 ID 생성
  const id = Date.now() + Math.random();
  
  // 24시간 후 만료 시간 계산
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  const newData = { 
    ...data, 
    id, 
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString() // 24시간 후 만료
  };
  
  // 배열 앞에 추가 (최신순)
  allData.unshift(newData);
  setCookie('mutualCheckData', allData);
  
  return newData;
};

// 모든 상호체크 데이터 가져오기 (만료된 항목 자동 삭제)
export const getAllMutualCheckData = () => {
  const data = getCookie('mutualCheckData') || [];
  if (!Array.isArray(data)) return [];
  
  const now = new Date();
  const validData = [];
  const expiredIds = [];
  
  // 만료된 항목 필터링
  data.forEach((item) => {
    if (item.expiresAt) {
      const expiresAt = new Date(item.expiresAt);
      if (expiresAt <= now) {
        expiredIds.push(item.id);
        return; // 만료된 항목은 제외
      }
    }
    validData.push(item);
  });
  
  // 만료된 항목이 있으면 쿠키 업데이트
  if (expiredIds.length > 0) {
    console.log('🗑️ 만료된 항목 삭제:', expiredIds.length, '개');
    setCookie('mutualCheckData', validData);
  }
  
  return validData;
};

// 특정 항목 삭제 (ID로)
export const deleteMutualCheckItem = (itemId) => {
  const allData = getAllMutualCheckData();
  const filteredData = allData.filter(item => item.id !== itemId);
  setCookie('mutualCheckData', filteredData);
};

// 모든 상호체크 데이터 삭제
export const clearAllMutualCheckData = () => {
  deleteCookie('mutualCheckData');
};

// ============================================
// 상호체크 좋아요 관련 함수들
// ============================================

export const getMutualCheckLikes = () => {
  return getCookie('mutualCheckLikes') || {};
};

export const toggleMutualCheckLike = (itemId) => {
  const likes = getMutualCheckLikes();
  likes[itemId] = !likes[itemId];
  setCookie('mutualCheckLikes', likes);
  return likes;
};
