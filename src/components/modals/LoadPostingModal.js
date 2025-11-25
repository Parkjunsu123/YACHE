import React, { useState, useEffect } from 'react';
import { getPostingAnalysesFromFirestore } from '../../utils/firestore';
import './Modal.css';

function LoadPostingModal({ isOpen, onClose, onLoad }) {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 모달이 열릴 때 데이터 로드
  useEffect(() => {
    if (isOpen) {
      loadAnalyses();
    }
  }, [isOpen]);

  const loadAnalyses = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPostingAnalysesFromFirestore();
      setAnalyses(data);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (analysis) => {
    if (onLoad) {
      onLoad(analysis);
    }
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>저장된 분석 결과 불러오기</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {error && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>로딩 중...</p>
            </div>
          ) : analyses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
              <p>저장된 분석 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="analysis-list">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="analysis-item"
                  onClick={() => handleItemClick(analysis)}
                >
                  <div className="analysis-item-header">
                    <h3 className="analysis-project-name">{analysis.projectName}</h3>
                    <span className="analysis-count">{analysis.totalCount || analysis.rows?.length || 0}개 항목</span>
                  </div>
                  <div className="analysis-item-footer">
                    <span className="analysis-date">{formatDate(analysis.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="modal-footer">
            <button 
              className="btn-cancel" 
              onClick={onClose}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadPostingModal;

