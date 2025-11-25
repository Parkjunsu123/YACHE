// Firestore 데이터베이스 유틸리티 함수

import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  where,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';

// ============================================
// 상호체크 데이터 관련 함수
// ============================================

/**
 * 상호체크 데이터를 Firestore에 추가
 * @param {Object} data - 저장할 데이터
 * @param {string} data.platform - 플랫폼 이름
 * @param {Object} data.project - 프로젝트 정보
 * @param {string} data.link - 링크 URL
 * @returns {Promise<string>} 생성된 문서 ID
 */
export const addMutualCheckToFirestore = async (data) => {
  try {
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다. 환경 변수를 확인해주세요.');
    }

    // 24시간 후 만료 시간 계산
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const docRef = await addDoc(collection(db, 'mutualChecks'), {
      platform: data.platform,
      project: data.project,
      link: data.link,
      ownerHandle: data.ownerHandle || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(expiresAt) // 24시간 후 만료
    });

    console.log('✅ Firestore에 저장 완료:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Firestore 저장 실패:', error);
    throw error;
  }
};

/**
 * Firestore에서 모든 상호체크 데이터 가져오기
 * @returns {Promise<Array>} 상호체크 데이터 배열
 */
export const getMutualChecksFromFirestore = async () => {
  try {
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다. 환경 변수를 확인해주세요.');
    }

    const q = query(
      collection(db, 'mutualChecks'),
      orderBy('createdAt', 'desc') // 최신순 정렬
    );

    const querySnapshot = await getDocs(q);
    const items = [];
    const now = new Date();
    const expiredIds = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const expiresAt = data.expiresAt?.toDate();
      
      // 만료된 항목 체크
      if (expiresAt && expiresAt <= now) {
        expiredIds.push(doc.id);
        return; // 만료된 항목은 추가하지 않음
      }

      items.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        expiresAt: expiresAt?.toISOString() || null
      });
    });

    // 만료된 항목 삭제
    if (expiredIds.length > 0) {
      console.log('🗑️ 만료된 항목 삭제:', expiredIds.length, '개');
      for (const id of expiredIds) {
        try {
          await deleteDoc(doc(db, 'mutualChecks', id));
        } catch (error) {
          console.error(`만료된 항목 삭제 실패 (${id}):`, error);
        }
      }
    }

    console.log('✅ Firestore에서 데이터 조회 완료:', items.length, '개');
    return items;
  } catch (error) {
    console.error('❌ Firestore 조회 실패:', error);
    throw error;
  }
};

/**
 * Firestore에서 특정 상호체크 데이터 삭제
 * @param {string} docId - 삭제할 문서 ID
 * @returns {Promise<void>}
 */
export const deleteMutualCheckFromFirestore = async (docId) => {
  try {
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다. 환경 변수를 확인해주세요.');
    }

    await deleteDoc(doc(db, 'mutualChecks', docId));
    console.log('✅ Firestore에서 삭제 완료:', docId);
  } catch (error) {
    console.error('❌ Firestore 삭제 실패:', error);
    throw error;
  }
};

// ============================================
// 포스팅 분석 결과 관련 함수
// ============================================

/**
 * 포스팅 분석 결과를 Firestore에 저장
 * @param {Object} data - 저장할 데이터
 * @param {string} data.projectName - 프로젝트 이름 (sentiment에서 추출)
 * @param {Array} data.rows - 분석 결과 행 데이터
 * @param {string} data.originalJson - 원본 JSON 데이터
 * @returns {Promise<string>} 생성된 문서 ID
 */
export const addPostingAnalysisToFirestore = async (data) => {
  try {
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다. 환경 변수를 확인해주세요.');
    }

    // 저장 전에 3일 지난 데이터 삭제
    await deleteOldPostingAnalyses();

    const docRef = await addDoc(collection(db, 'postingAnalyses'), {
      projectName: data.projectName,
      rows: data.rows,
      originalJson: data.originalJson,
      totalCount: data.rows?.length || 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log('✅ 포스팅 분석 결과 Firestore 저장 완료:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ 포스팅 분석 결과 Firestore 저장 실패:', error);
    throw error;
  }
};

/**
 * 3일 지난 포스팅 분석 결과 삭제
 * @returns {Promise<void>}
 */
const deleteOldPostingAnalyses = async () => {
  try {
    if (!db) {
      return;
    }

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoTimestamp = Timestamp.fromDate(threeDaysAgo);

    const q = query(
      collection(db, 'postingAnalyses'),
      where('createdAt', '<', threeDaysAgoTimestamp)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = [];

    querySnapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(docSnap.ref));
    });

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log(`🗑️ 3일 지난 포스팅 분석 결과 ${deletePromises.length}개 삭제 완료`);
    }
  } catch (error) {
    console.error('❌ 오래된 포스팅 분석 결과 삭제 실패:', error);
    // 삭제 실패해도 저장은 계속 진행
  }
};

/**
 * Firestore에서 모든 포스팅 분석 결과 가져오기
 * @returns {Promise<Array>} 포스팅 분석 결과 배열
 */
export const getPostingAnalysesFromFirestore = async () => {
  try {
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다. 환경 변수를 확인해주세요.');
    }

    const q = query(
      collection(db, 'postingAnalyses'),
      orderBy('createdAt', 'desc') // 최신순 정렬
    );

    const querySnapshot = await getDocs(q);
    const items = [];
    const now = new Date();
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const expiredIds = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate();
      
      // 3일 지난 데이터 체크
      if (createdAt && createdAt < threeDaysAgo) {
        expiredIds.push(doc.id);
        return; // 3일 지난 항목은 추가하지 않음
      }

      items.push({
        id: doc.id,
        ...data,
        createdAt: createdAt?.toISOString() || new Date().toISOString()
      });
    });

    // 3일 지난 항목 삭제
    if (expiredIds.length > 0) {
      console.log('🗑️ 3일 지난 포스팅 분석 결과 삭제:', expiredIds.length, '개');
      for (const id of expiredIds) {
        try {
          await deleteDoc(doc(db, 'postingAnalyses', id));
        } catch (error) {
          console.error(`3일 지난 항목 삭제 실패 (${id}):`, error);
        }
      }
    }

    console.log('✅ Firestore에서 포스팅 분석 결과 조회 완료:', items.length, '개');
    return items;
  } catch (error) {
    console.error('❌ Firestore 포스팅 분석 결과 조회 실패:', error);
    throw error;
  }
};

/**
 * Firestore에서 특정 포스팅 분석 결과 삭제
 * @param {string} docId - 삭제할 문서 ID
 * @returns {Promise<void>}
 */
export const deletePostingAnalysisFromFirestore = async (docId) => {
  try {
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다. 환경 변수를 확인해주세요.');
    }

    await deleteDoc(doc(db, 'postingAnalyses', docId));
    console.log('✅ Firestore에서 포스팅 분석 결과 삭제 완료:', docId);
  } catch (error) {
    console.error('❌ Firestore 포스팅 분석 결과 삭제 실패:', error);
    throw error;
  }
};

// ============================================
// 일반적인 Firestore 유틸리티 함수
// ============================================

/**
 * 특정 컬렉션에 문서 추가
 * @param {string} collectionName - 컬렉션 이름
 * @param {Object} data - 저장할 데이터
 * @returns {Promise<string>} 생성된 문서 ID
 */
export const addDocument = async (collectionName, data) => {
  try {
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }

    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return docRef.id;
  } catch (error) {
    console.error(`❌ ${collectionName} 저장 실패:`, error);
    throw error;
  }
};

/**
 * 특정 컬렉션의 모든 문서 가져오기
 * @param {string} collectionName - 컬렉션 이름
 * @param {string} orderByField - 정렬 필드 (선택사항)
 * @param {string} orderDirection - 정렬 방향 ('asc' | 'desc', 기본값: 'desc')
 * @returns {Promise<Array>} 문서 배열
 */
export const getDocuments = async (collectionName, orderByField = null, orderDirection = 'desc') => {
  try {
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }

    let q = collection(db, collectionName);
    
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }

    const querySnapshot = await getDocs(q);
    const items = [];

    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate()?.toISOString() || null
      });
    });

    return items;
  } catch (error) {
    console.error(`❌ ${collectionName} 조회 실패:`, error);
    throw error;
  }
};

/**
 * 특정 문서 삭제
 * @param {string} collectionName - 컬렉션 이름
 * @param {string} docId - 문서 ID
 * @returns {Promise<void>}
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }

    await deleteDoc(doc(db, collectionName, docId));
    console.log(`✅ ${collectionName}에서 삭제 완료:`, docId);
  } catch (error) {
    console.error(`❌ ${collectionName} 삭제 실패:`, error);
    throw error;
  }
};

// ============================================
// 사용자 프로필 저장
// ============================================

export const saveUserProfile = async ({ twitterHandle, codeHash }) => {
  try {
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }

    const docRef = await addDoc(collection(db, 'userProfiles'), {
      twitterHandle,
      twitterHandleLower: twitterHandle.toLowerCase(),
      codeHash,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return docRef.id;
  } catch (error) {
    console.error('❌ 사용자 프로필 저장 실패:', error);
    throw error;
  }
};

export const getUserProfileByHandle = async (twitterHandle) => {
  try {
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }

    const normalized = twitterHandle.toLowerCase();
    const q = query(
      collection(db, 'userProfiles'),
      where('twitterHandleLower', '==', normalized),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error('❌ 사용자 프로필 조회 실패:', error);
    throw error;
  }
};

