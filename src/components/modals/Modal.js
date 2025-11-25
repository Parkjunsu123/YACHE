import React, { useState, useEffect } from 'react';
import ProjectImage from '../ProjectImage';
import { projectsByPlatform } from '../../data/projects';
import { addDailyCheckData, getPlatformFavorites, toggleFavorite } from '../../utils/storage';
import './Modal.css';

function Modal({ isOpen, onClose, date, onSave }) {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [xPostLink, setXPostLink] = useState('');
  const [favorites, setFavorites] = useState({});

  // 즐겨찾기 로드
  useEffect(() => {
    if (selectedPlatform) {
      const platformFavorites = getPlatformFavorites(selectedPlatform);
      setFavorites(prev => ({ ...prev, [selectedPlatform]: platformFavorites }));
    }
  }, [selectedPlatform]);

  if (!isOpen) return null;

  // 즐겨찾기 토글
  const handleFavoriteClick = (e, ticker) => {
    e.stopPropagation(); // 프로젝트 선택 이벤트 방지
    const updatedFavorites = toggleFavorite(selectedPlatform, ticker);
    setFavorites(prev => ({ ...prev, [selectedPlatform]: updatedFavorites }));
  };

  // 프로젝트 정렬 (즐겨찾기 우선, 그 다음 알파벳 순)
  const getSortedProjects = (projects) => {
    const platformFavorites = favorites[selectedPlatform] || [];
    return [...projects].sort((a, b) => {
      const aIsFavorite = platformFavorites.includes(a.ticker);
      const bIsFavorite = platformFavorites.includes(b.ticker);
      
      // 즐겨찾기 우선
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      // 같은 그룹 내에서 알파벳 순
      return a.name.localeCompare(b.name);
    });
  };

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const formatDateString = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 날짜 포맷팅 (표시용)
  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekDay = weekDays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekDay})`;
  };

  // 플랫폼 선택
  const handlePlatformClick = (platform) => {
    setSelectedPlatform(platform);
    setSelectedProject(''); // 플랫폼 변경 시 프로젝트 선택 초기화
  };

  // 프로젝트 선택
  const handleProjectClick = (ticker) => {
    setSelectedProject(ticker);
  };

  // 선택된 프로젝트 정보
  const getSelectedProjectInfo = () => {
    if (!selectedPlatform || !selectedProject) return null;
    return projectsByPlatform[selectedPlatform].find(p => p.ticker === selectedProject);
  };

  // 저장 버튼 클릭
  const handleSave = () => {
    if (!selectedPlatform || !selectedProject) {
      alert('플랫폼과 프로젝트를 선택해주세요.');
      return;
    }

    const projectInfo = getSelectedProjectInfo();
    const dateString = formatDateString(date);
    
    const data = {
      platform: selectedPlatform,
      project: projectInfo,
      xPostLink: xPostLink,
      savedAt: new Date().toISOString()
    };

    // 쿠키에 추가 (배열에 추가)
    const savedData = addDailyCheckData(dateString, data);
    
    console.log('저장 완료:', {
      date: dateString,
      data: savedData
    });

    // 부모 컴포넌트에 알림 (캘린더 업데이트용)
    if (onSave) {
      onSave();
    }

    // 폼 초기화
    setSelectedPlatform('');
    setSelectedProject('');
    setXPostLink('');

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{formatDate(date)}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {/* 플랫폼 선택 */}
          <div className="form-group">
            <label>info-fi 플랫폼</label>
            <div className="platform-buttons">
              <button
                className={`platform-btn ${selectedPlatform === '카이토' ? 'active' : ''}`}
                onClick={() => handlePlatformClick('카이토')}
              >
                카이토
              </button>
              <button
                className={`platform-btn ${selectedPlatform === '쿠키' ? 'active' : ''}`}
                onClick={() => handlePlatformClick('쿠키')}
              >
                쿠키
              </button>
              <button
                className={`platform-btn ${selectedPlatform === '월체인' ? 'active' : ''}`}
                onClick={() => handlePlatformClick('월체인')}
              >
                월체인
              </button>
              <button
                className={`platform-btn ${selectedPlatform === '기타' ? 'active' : ''}`}
                onClick={() => handlePlatformClick('기타')}
              >
                기타
              </button>
            </div>
          </div>

          {/* 프로젝트 선택 (플랫폼 선택 시에만 표시) */}
          {selectedPlatform && (
            <div className="form-group">
              <label>프로젝트</label>
              <div className="project-list">
                {getSortedProjects(projectsByPlatform[selectedPlatform])
                  .map((project) => {
                    const platformFavorites = favorites[selectedPlatform] || [];
                    const isFav = platformFavorites.includes(project.ticker);
                    
                    return (
                      <div
                        key={project.ticker}
                        className={`project-item ${selectedProject === project.ticker ? 'selected' : ''}`}
                        onClick={() => handleProjectClick(project.ticker)}
                      >
                        <ProjectImage 
                          ticker={project.ticker}
                          platform={selectedPlatform === '카이토' ? 'kaito' : 'other'}
                          size="40px"
                          logo={project.logo}
                        />
                        <span className="project-name">{project.name}</span>
                        <button
                          className={`favorite-btn ${isFav ? 'active' : ''}`}
                          onClick={(e) => handleFavoriteClick(e, project.ticker)}
                          title={isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                        >
                          {isFav ? '★' : '☆'}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* X 포스팅 링크 */}
          <div className="form-group">
            <label htmlFor="x-post-link">X 포스팅 링크</label>
            <input
              type="url"
              id="x-post-link"
              className="form-input"
              placeholder="https://x.com/..."
              value={xPostLink}
              onChange={(e) => setXPostLink(e.target.value)}
            />
          </div>

          {/* 버튼 */}
          <div className="modal-footer">
            <button className="btn-cancel" onClick={onClose}>
              취소
            </button>
            <button className="btn-save" onClick={handleSave}>
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
