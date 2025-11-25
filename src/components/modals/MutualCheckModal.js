import React, { useState, useEffect } from 'react';
import ProjectImage from '../ProjectImage';
import { projectsByPlatform } from '../../data/projects';
import { getPlatformFavorites, toggleFavorite } from '../../utils/storage';
import { addMutualCheckToFirestore } from '../../utils/firestore';
import './Modal.css';

function MutualCheckModal({ isOpen, onClose, onSave, currentHandle }) {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [link, setLink] = useState('');
  const [favorites, setFavorites] = useState({});

  // 즐겨찾기 로드
  useEffect(() => {
    if (selectedPlatform) {
      const platformFavorites = getPlatformFavorites(selectedPlatform);
      setFavorites(prev => ({ ...prev, [selectedPlatform]: platformFavorites }));
    }
  }, [selectedPlatform]);

  // 모달이 닫힐 때 초기화
  useEffect(() => {
    if (!isOpen) {
      setSelectedPlatform('');
      setSelectedProject('');
      setLink('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 즐겨찾기 토글
  const handleFavoriteClick = (e, ticker) => {
    e.stopPropagation();
    const updatedFavorites = toggleFavorite(selectedPlatform, ticker);
    setFavorites(prev => ({ ...prev, [selectedPlatform]: updatedFavorites }));
  };

  // 프로젝트 정렬 (즐겨찾기 우선, 그 다음 알파벳 순)
  const getSortedProjects = (projects) => {
    const platformFavorites = favorites[selectedPlatform] || [];
    return [...projects].sort((a, b) => {
      const aIsFavorite = platformFavorites.includes(a.ticker);
      const bIsFavorite = platformFavorites.includes(b.ticker);
      
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      return a.name.localeCompare(b.name);
    });
  };

  // 플랫폼 선택
  const handlePlatformClick = (platform) => {
    setSelectedPlatform(platform);
    setSelectedProject('');
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

  const sanitizeLink = (rawLink) => {
    if (!rawLink) return '';
    try {
      const urlObj = new URL(rawLink);
      urlObj.search = '';
      urlObj.hash = '';
      return `${urlObj.origin}${urlObj.pathname}`;
    } catch {
      const idx = rawLink.indexOf('?');
      return idx !== -1 ? rawLink.slice(0, idx) : rawLink;
    }
  };

  // 완료 버튼 클릭
  const handleComplete = async () => {
    if (!selectedPlatform || !selectedProject) {
      alert('플랫폼과 프로젝트를 선택해주세요.');
      return;
    }

    if (!link.trim()) {
      alert('링크를 입력해주세요.');
      return;
    }

    if (!currentHandle) {
      alert('로그인 정보가 필요합니다. 다시 로그인해주세요.');
      return;
    }

    const normalizedHandle = currentHandle.replace('@', '').toLowerCase();
    const sanitizedLink = link.trim();
    let handleMatches = false;
    try {
      const url = new URL(sanitizedLink);
      handleMatches = url.pathname.toLowerCase().startsWith(`/${normalizedHandle}`);
    } catch (error) {
      handleMatches = sanitizedLink.toLowerCase().includes(normalizedHandle);
    }

    if (!handleMatches) {
      alert('해당 링크는 로그인한 핸들이 포함된 링크가 아닙니다.');
      return;
    }

    const projectInfo = getSelectedProjectInfo();
    const normalizedLink = sanitizeLink(sanitizedLink);
    setLink(normalizedLink);
    
    const data = {
      platform: selectedPlatform,
      project: projectInfo,
      link: normalizedLink,
      ownerHandle: currentHandle
    };

    // 쿠키에 저장
    if (onSave) {
      onSave(data);
    }

    // Firebase에 저장 (비동기, 실패해도 쿠키 저장은 유지)
    try {
      await addMutualCheckToFirestore(data);
      console.log('✅ Firebase 저장 완료');
    } catch (error) {
      console.error('⚠️ Firebase 저장 실패 (쿠키에는 저장됨):', error);
      // Firebase 저장 실패해도 쿠키에는 저장되므로 계속 진행
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>상호체크 추가</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {/* 플랫폼 선택 */}
          <div className="form-group">
            <label>플랫폼</label>
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

          {/* 프로젝트 선택 */}
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

          {/* 링크 입력 */}
          <div className="form-group">
            <label htmlFor="link">링크</label>
            <input
              type="url"
              id="link"
              className="form-input"
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          {/* 버튼 */}
          <div className="modal-footer">
            <button className="btn-cancel" onClick={onClose}>
              취소
            </button>
            <button className="btn-save" onClick={handleComplete}>
              완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MutualCheckModal;

