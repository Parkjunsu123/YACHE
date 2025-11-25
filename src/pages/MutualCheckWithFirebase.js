// Firebase 연동 예시 - 상호체크 페이지
// 이 파일은 예시입니다. 실제 사용하려면 MutualCheck.js를 수정하세요.

import React, { useState, useEffect } from 'react';
import MutualCheckModal from '../components/modals/MutualCheckModal';
import ProjectImage from '../components/ProjectImage';
import { 
  getAllMutualCheckData, 
  addMutualCheckData, 
  deleteMutualCheckItem 
} from '../utils/storage';
import { 
  getMutualChecksFromFirestore,
  addMutualCheckToFirestore,
  deleteMutualCheckFromFirestore
} from '../utils/firestore';
import './MutualCheck.css';

function MutualCheckWithFirebase() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [useFirebase, setUseFirebase] = useState(false); // Firebase 사용 여부 토글
  const [loading, setLoading] = useState(false);

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, [useFirebase]);

  // Firebase 또는 쿠키에서 데이터 로드
  const loadData = async () => {
    setLoading(true);
    try {
      if (useFirebase) {
        // Firebase에서 데이터 가져오기
        const data = await getMutualChecksFromFirestore();
        setItems(data);
      } else {
        // 쿠키에서 데이터 가져오기
        const data = getAllMutualCheckData();
        setItems(data);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 모달 열기
  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 저장 완료
  const handleSave = async (data) => {
    try {
      if (useFirebase) {
        // Firebase에 저장
        await addMutualCheckToFirestore(data);
      } else {
        // 쿠키에 저장
        addMutualCheckData(data);
      }
      loadData();
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  // 항목 삭제
  const handleDelete = async (itemId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        if (useFirebase) {
          // Firebase에서 삭제
          await deleteMutualCheckFromFirestore(itemId);
        } else {
          // 쿠키에서 삭제
          deleteMutualCheckItem(itemId);
        }
        loadData();
      } catch (error) {
        console.error('삭제 실패:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  // 링크 열기
  const handleLinkClick = (link) => {
    window.open(link, '_blank');
  };

  return (
    <div className="mutual-check">
      <div className="mutual-check-header">
        <h2>상호 체크</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Firebase 사용 여부 토글 */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useFirebase}
              onChange={(e) => setUseFirebase(e.target.checked)}
            />
            <span>Firebase 사용</span>
          </label>
          <button className="add-btn" onClick={handleAddClick}>
            + 추가
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <p>로딩 중...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>등록된 상호체크가 없습니다.</p>
          <p>추가 버튼을 눌러 상호체크를 등록해주세요.</p>
        </div>
      ) : (
        <div className="mutual-check-grid">
          {items.map((item) => (
            <div key={item.id} className="mutual-check-card">
              <div className="card-header">
                <div className="card-project-info">
                  <ProjectImage
                    ticker={item.project.ticker}
                    platform={item.platform === '카이토' ? 'kaito' : 'other'}
                    size="50px"
                    logo={item.project.logo}
                  />
                  <div className="card-project-details">
                    <h3 className="card-project-name">{item.project.name}</h3>
                    <span className="card-platform">{item.platform}</span>
                  </div>
                </div>
                <button 
                  className="card-delete-btn"
                  onClick={() => handleDelete(item.id)}
                  title="삭제"
                >
                  ✕
                </button>
              </div>
              <div className="card-body">
                <div className="card-link" onClick={() => handleLinkClick(item.link)}>
                  <span className="link-text">{item.link}</span>
                  <span className="link-icon">↗</span>
                </div>
              </div>
              {item.createdAt && (
                <div className="card-footer">
                  <span className="card-date">
                    {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <MutualCheckModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  );
}

export default MutualCheckWithFirebase;

