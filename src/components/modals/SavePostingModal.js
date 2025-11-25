import React, { useState, useEffect } from 'react';
import { addPostingAnalysisToFirestore } from '../../utils/firestore';
import './Modal.css';

function SavePostingModal({ isOpen, onClose, tableData, originalJson }) {
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // sentiment에서 프로젝트명 추출
  useEffect(() => {
    if (isOpen) {
      extractProjectName();
    }
  }, [isOpen, tableData, originalJson]);

  // 프로젝트명 추출 함수
  const extractProjectName = () => {
    // 먼저 원본 JSON에서 ticker_sentiment 키 추출 시도
    const projectNameFromJson = extractProjectNameFromJson();
    if (projectNameFromJson) {
      setProjectName(projectNameFromJson);
      return;
    }

    // 원본 JSON에서 추출 실패 시, 테이블 데이터에서 추출
    if (tableData && tableData.rows && tableData.rows.length > 0) {
      const firstRow = tableData.rows[0];
      if (firstRow.sentiment) {
        // sentiment가 "EVERLYN:0.8" 형식일 수 있으므로 처리
        const sentimentStr = String(firstRow.sentiment);
        if (sentimentStr.includes(':')) {
          const parts = sentimentStr.split(':');
          setProjectName(parts[0].trim());
          return;
        }
      }
    }
    
    // 모두 실패 시 기본값
    setProjectName('');
  };

  // 원본 JSON에서 프로젝트명 추출
  const extractProjectNameFromJson = () => {
    try {
      if (originalJson) {
        const parsed = JSON.parse(originalJson);
        const documents = parsed.documents || [];
        
        // 모든 문서를 확인하여 ticker_sentiment 키 찾기
        for (const doc of documents) {
          const tickerSentiment = doc.ticker_sentiment || {};
          const projectKeys = Object.keys(tickerSentiment);
          if (projectKeys.length > 0) {
            return projectKeys[0]; // 첫 번째 프로젝트명 반환
          }
        }
      }
    } catch (err) {
      console.error('프로젝트명 추출 실패:', err);
    }
    
    return null;
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!projectName.trim()) {
      setError('프로젝트명을 찾을 수 없습니다. 저장할 수 없습니다.');
      return;
    }

    if (!tableData || !tableData.rows || tableData.rows.length === 0) {
      setError('저장할 데이터가 없습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addPostingAnalysisToFirestore({
        projectName: projectName.trim(),
        rows: tableData.rows,
        originalJson: originalJson || ''
      });

      alert('저장이 완료되었습니다!');
      onClose();
    } catch (err) {
      console.error('저장 실패:', err);
      setError('저장에 실패했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>분석 결과 저장</h2>
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

          <div className="form-group">
            <label>프로젝트명</label>
            <div 
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem',
                color: '#333',
                fontWeight: '500'
              }}
            >
              {projectName || '프로젝트명을 찾을 수 없습니다'}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
              저장할 항목 수: {tableData?.rows?.length || 0}개
            </p>
          </div>

          <div 
            style={{
              padding: '1rem',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '6px',
              marginTop: '1rem',
              fontSize: '0.9rem',
              color: '#856404',
              lineHeight: '1.5'
            }}
          >
            ⚠️ 비KYC 유저를 위한 기능이니 본인 데이터만 있는 JSON 데이터는 저장을 삼가해주시면 감사하겠습니다.
          </div>

          <div className="modal-footer">
            <button 
              className="btn-cancel" 
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
            <button 
              className="btn-save" 
              onClick={handleSave}
              disabled={loading || !projectName.trim()}
            >
              {loading ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SavePostingModal;

