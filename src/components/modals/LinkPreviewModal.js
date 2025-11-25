import React, { useState, useEffect } from 'react';
import './Modal.css';

function LinkPreviewModal({ isOpen, onClose, link }) {
  const [isTwitter, setIsTwitter] = useState(false);
  const [embedHtml, setEmbedHtml] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && link) {
      checkLinkType();
    }
  }, [isOpen, link]);

  const checkLinkType = () => {
    if (!link) return;
    
    // Twitter/X 링크 확인
    const twitterPattern = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[\w\/]+/i;
    if (twitterPattern.test(link)) {
      setIsTwitter(true);
      loadTwitterEmbed();
    } else {
      setIsTwitter(false);
    }
  };

  const loadTwitterEmbed = async () => {
    setLoading(true);
    try {
      // Twitter oEmbed API 사용 (CORS 프록시 없이는 실패할 수 있음)
      const tweetUrl = link.replace(/^https?:\/\//, '').replace(/^www\./, '');
      const oembedUrl = `https://publish.twitter.com/oembed?url=https://${tweetUrl}&theme=light&omit_script=true`;
      
      // CORS 프록시 사용 (또는 백엔드에서 처리)
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(oembedUrl)}`;
      
      try {
        const response = await fetch(proxyUrl);
        const data = await response.json();
        const parsed = JSON.parse(data.contents);
        
        if (parsed.html) {
          setEmbedHtml(parsed.html);
          // Twitter embed script 로드
          loadTwitterScript();
        }
      } catch (proxyError) {
        // 프록시 실패 시 직접 시도
        const directResponse = await fetch(oembedUrl);
        const directData = await directResponse.json();
        if (directData.html) {
          setEmbedHtml(directData.html);
          loadTwitterScript();
        }
      }
    } catch (error) {
      console.error('Twitter embed 로드 실패:', error);
      // 실패 시 직접 링크 표시
    } finally {
      setLoading(false);
    }
  };

  const loadTwitterScript = () => {
    // Twitter embed script가 이미 로드되었는지 확인
    if (window.twttr) {
      window.twttr.widgets.load();
      return;
    }

    // Twitter embed script 동적 로드
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.charset = 'utf-8';
    script.async = true;
    script.onload = () => {
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load();
      }
    };
    document.body.appendChild(script);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content link-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>링크 미리보기</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>로딩 중...</p>
            </div>
          ) : isTwitter && embedHtml ? (
            <div 
              className="twitter-embed-container"
              dangerouslySetInnerHTML={{ __html: embedHtml }}
            />
          ) : (
            <div className="link-preview-fallback">
              <p style={{ marginBottom: '1rem', color: '#666' }}>
                링크 미리보기를 사용할 수 없습니다.
              </p>
              <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="preview-link-btn"
              >
                새 탭에서 열기 ↗
              </a>
              <div className="link-url-display">
                <span>{link}</span>
              </div>
            </div>
          )}
          
          <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
            <button className="btn-cancel" onClick={onClose}>
              닫기
            </button>
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-save"
              style={{ textDecoration: 'none', display: 'inline-block' }}
            >
              새 탭에서 열기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinkPreviewModal;

