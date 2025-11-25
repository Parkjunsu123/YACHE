import React, { useState, useEffect } from 'react';
import { FaHeart } from 'react-icons/fa';
import MutualCheckModal from '../components/modals/MutualCheckModal';
import ProjectImage from '../components/ProjectImage';
import {
  getAllMutualCheckData,
  addMutualCheckData,
  getMutualCheckLikes,
  toggleMutualCheckLike,
  getUserSession
} from '../utils/storage';
import { getLinkPreview } from '../utils/linkPreview';
import './MutualCheck.css';
import { getMutualChecksFromFirestore } from '../utils/firestore';

function MutualCheck() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [previews, setPreviews] = useState({}); // { itemId: previewData }
  const [likes, setLikes] = useState({}); // { itemId: true/false }
  const [userSession, setUserSession] = useState(() => getUserSession());

  // 데이터 로드
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 좋아요 상태 로드
    const savedLikes = getMutualCheckLikes();
    setLikes(savedLikes);
  }, []);

  useEffect(() => {
    const handleSessionChange = () => {
      setUserSession(getUserSession());
    };
    window.addEventListener('user-session-changed', handleSessionChange);
    return () => {
      window.removeEventListener('user-session-changed', handleSessionChange);
    };
  }, []);

  // 미리보기 데이터 로드
  useEffect(() => {
    if (items.length > 0) {
      loadPreviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const loadPreviews = async () => {
    const newPreviews = {};
    
    for (const item of items) {
      if (item.link && !previews[item.id]) {
        try {
          const preview = await getLinkPreview(item.link);
          if (preview) {
            newPreviews[item.id] = preview;
          }
        } catch (error) {
          console.error(`미리보기 로드 실패 (${item.id}):`, error);
        }
      }
    }
    
    if (Object.keys(newPreviews).length > 0) {
      setPreviews(prev => ({ ...prev, ...newPreviews }));
    }
  };

  const sortItemsWithLikes = (list, likesMap = {}) => {
    const safeLikes = likesMap || {};
    return [...list].sort((a, b) => {
      const aLiked = safeLikes[a.id] || false;
      const bLiked = safeLikes[b.id] || false;

      if (!aLiked && bLiked) return -1;
      if (aLiked && !bLiked) return 1;

      const aDate = new Date(a.createdAt || a.timestamp || 0).getTime() || 0;
      const bDate = new Date(b.createdAt || b.timestamp || 0).getTime() || 0;
      return aDate - bDate;
    });
  };

  const loadData = async () => {
    try {
      const remoteData = await getMutualChecksFromFirestore();
      setItems(sortItemsWithLikes(remoteData, likes));
    } catch (error) {
      console.error('상호체크 데이터를 불러오지 못했습니다. 로컬 데이터를 사용합니다.', error);
      const localData = getAllMutualCheckData();
      setItems(sortItemsWithLikes(localData, likes));
    }
  };

  useEffect(() => {
    setItems(prev => {
      if (!prev.length) return prev;
      return sortItemsWithLikes(prev, likes);
    });
  }, [likes]);

  const getRemainingCooldown = () => {
    if (!userSession || !items.length) return 0;
    const handle = userSession.twitterHandle?.toLowerCase();
    if (!handle) return 0;
    const handleItems = items.filter(
      (item) => (item.ownerHandle || '').toLowerCase() === handle
    );
    if (!handleItems.length) return 0;
    const lastTimestamp = Math.max(
      ...handleItems.map((item) =>
        new Date(item.createdAt || item.timestamp || 0).getTime()
      )
    );
    if (!lastTimestamp || Number.isNaN(lastTimestamp)) return 0;
    const COOLDOWN_MS = 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - lastTimestamp;
    const remaining = COOLDOWN_MS - elapsed;
    return remaining > 0 ? remaining : 0;
  };

  const formatRemainingTime = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    if (minutes > 0) {
      return `${minutes}분 ${seconds}초`;
    }
    return `${seconds}초`;
  };

  // 모달 열기
  const handleAddClick = () => {
    if (!userSession) {
      alert('상호체크를 등록하려면 먼저 로그인해주세요.');
      return;
    }
    const remaining = getRemainingCooldown();
    if (remaining > 0) {
      alert(
        `등록 후 24시간이 지나야 합니다.\n${formatRemainingTime(
          remaining
        )} 후에 다시 등록할 수 있습니다.`
      );
      return;
    }
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 저장 완료
  const handleSave = (data) => {
    addMutualCheckData(data);
    loadData();
  };

  const handleToggleLike = (itemId) => {
    const updatedLikes = toggleMutualCheckLike(itemId);
    setLikes(updatedLikes);
  };

  // 링크 열기
  const handleLinkClick = (link) => {
    window.open(link, '_blank');
  };

  return (
    <div className="mutual-check">
      <div className="mutual-check-header">
        <h2>상호 체크</h2>
        {userSession ? (
          <button className="add-btn" onClick={handleAddClick}>
            + 추가
          </button>
        ) : (
          <div className="add-btn disabled">로그인 후 등록 가능</div>
        )}
      </div>

      {items.length === 0 ? (
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
                  className={`card-heart-btn ${likes[item.id] ? 'liked' : ''}`}
                  onClick={() => handleToggleLike(item.id)}
                  title={likes[item.id] ? '즐겨찾기 해제' : '즐겨찾기'}
                  aria-label="즐겨찾기"
                >
                  <FaHeart />
                </button>
              </div>
              <div className="card-body">
                {previews[item.id] ? (
                  <div className="card-preview" onClick={() => handleLinkClick(item.link)}>
                    {previews[item.id].image && (
                      <div className="preview-image">
                        <img src={previews[item.id].image} alt={previews[item.id].title} />
                      </div>
                    )}
                    <div className="preview-content">
                      {previews[item.id].type === 'twitter' && (
                        <div className="preview-header">
                          <span className="preview-site">FxTwitter</span>
                        </div>
                      )}
                      {previews[item.id].author && (
                        <div className="preview-author">
                          <strong>{previews[item.id].author}</strong>
                          {previews[item.id].authorHandle && (
                            <span className="preview-handle">(@{previews[item.id].authorHandle})</span>
                          )}
                        </div>
                      )}
                      {previews[item.id].title && (
                        <div className="preview-title">{previews[item.id].title}</div>
                      )}
                      {previews[item.id].description && (
                        <div className="preview-description">
                          {previews[item.id].description.length > 150 
                            ? previews[item.id].description.substring(0, 150) + '...'
                            : previews[item.id].description}
                        </div>
                      )}
                      <div className="preview-footer">
                        <span className="preview-link-text">{item.link}</span>
                        <span className="preview-link-icon">↗</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card-link" onClick={() => handleLinkClick(item.link)}>
                    <span className="link-text">{item.link}</span>
                    <span className="link-icon">↗</span>
                  </div>
                )}
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
        currentHandle={userSession?.twitterHandle || ''}
      />
    </div>
  );
}

export default MutualCheck;

