import React, { useState } from 'react';
import ProjectImage from '../ProjectImage';
import { deleteDailyCheckItem, getCookie, setCookie } from '../../utils/storage';
import './ListModal.css';

function ListModal({ isOpen, onClose, date, items, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editLink, setEditLink] = useState('');

  if (!isOpen) return null;

  // 날짜 포맷팅
  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekDay = weekDays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekDay})`;
  };

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const formatDateString = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 수정 모드 시작
  const handleEditStart = (item) => {
    setEditingId(item.id);
    setEditLink(item.xPostLink || '');
  };

  // 수정 취소
  const handleEditCancel = () => {
    setEditingId(null);
    setEditLink('');
  };

  // 링크 수정 저장
  const handleEditSave = (item) => {
    // 기존 항목 삭제 후 새로운 항목으로 추가
    const dateString = formatDateString(date);
    deleteDailyCheckItem(dateString, item.id);
    
    // 쿠키에서 데이터 가져오기
    const allData = getCookie('dailyCheckData') || {};
    if (!allData[dateString]) {
      allData[dateString] = [];
    }
    
    // 수정된 데이터 추가
    const updatedItem = { ...item, xPostLink: editLink, id: Date.now() + Math.random() };
    allData[dateString].push(updatedItem);
    
    setCookie('dailyCheckData', allData);
    
    setEditingId(null);
    setEditLink('');
    onUpdate();
  };

  // 삭제
  const handleDelete = (item) => {
    if (window.confirm('이 항목을 삭제하시겠습니까?')) {
      const dateString = formatDateString(date);
      deleteDailyCheckItem(dateString, item.id);
      onUpdate();
    }
  };

  return (
    <div className="list-modal-overlay" onClick={onClose}>
      <div className="list-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="list-modal-header">
          <h2>{formatDate(date)}</h2>
          <button className="list-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="list-modal-body">
          <div className="items-list">
            {items.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-info">
                  <div className="item-project">
                    <ProjectImage 
                      ticker={item.project.ticker}
                      platform="kaito"
                      size="40px"
                      logo={item.project.logo}
                    />
                    <div className="item-details">
                      <span className="item-name">{item.project.name}</span>
                    </div>
                  </div>
                  
                  {editingId === item.id ? (
                    <div className="item-edit">
                      <input
                        type="url"
                        className="edit-input"
                        placeholder="https://x.com/..."
                        value={editLink}
                        onChange={(e) => setEditLink(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="item-link">
                      {item.xPostLink ? (
                        <a 
                          href={item.xPostLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="link-text"
                        >
                          X 포스팅 보기
                        </a>
                      ) : (
                        <span className="no-link">링크 없음</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="item-actions">
                  {editingId === item.id ? (
                    <>
                      <button className="btn-save-small" onClick={() => handleEditSave(item)}>
                        저장
                      </button>
                      <button className="btn-cancel-small" onClick={handleEditCancel}>
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn-edit" onClick={() => handleEditStart(item)}>
                        수정
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(item)}>
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListModal;

