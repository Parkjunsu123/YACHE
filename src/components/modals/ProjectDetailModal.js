import React from 'react';
import ProjectImage from '../ProjectImage';
import './ProjectDetailModal.css';

function ProjectDetailModal({ isOpen, onClose, project, entries }) {
  if (!isOpen || !project) return null;

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekDay = weekDays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekDay})`;
  };

  // 날짜순으로 정렬 (최신순)
  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="project-detail-overlay" onClick={onClose}>
      <div className="project-detail-content" onClick={(e) => e.stopPropagation()}>
        <div className="project-detail-header">
          <div className="project-detail-title">
            <ProjectImage 
              ticker={project.ticker}
              platform="kaito"
              size="40px"
              logo={project.logo}
            />
            <h2>{project.name}</h2>
          </div>
          <button className="project-detail-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="project-detail-body">
          <div className="project-detail-summary">
            <span className="summary-label">총 등록 횟수</span>
            <span className="summary-count">{entries.length}회</span>
          </div>

          <div className="project-detail-list">
            {sortedEntries.map((entry, index) => (
              <div key={index} className="detail-entry">
                <div className="entry-date">
                  <span className="date-text">{formatDate(entry.date)}</span>
                </div>
                <div className="entry-link">
                  {entry.link ? (
                    <a 
                      href={entry.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="link-button"
                    >
                      <span className="link-icon">🔗</span>
                      <span className="link-text">X 포스팅 보기</span>
                    </a>
                  ) : (
                    <span className="no-link-text">링크 없음</span>
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

export default ProjectDetailModal;

