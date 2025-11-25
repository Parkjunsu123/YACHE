import React, { useState, useEffect } from 'react';
import './ProjectImage.css';

function ProjectImage({ ticker, platform = 'kaito', size = '30px', logo = null }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!ticker) {
      setIsLoading(false);
      return;
    }

    // logo URL이 직접 제공된 경우 (Wallchain 등)
    if (logo) {
      setImageUrl(logo);
      setIsLoading(false);
      return;
    }

    // 초기화
    setIsLoading(true);
    setHasError(false);

    // 이미지 URL 생성 (Kaito용)
    const baseUrls = {
      kaito: 'https://kaito-public-assets.s3.us-west-2.amazonaws.com/ticker-icons',
    };

    const baseUrl = baseUrls[platform];
    if (!baseUrl) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    const tickerUpper = ticker.toUpperCase();
    const extensions = ['jpg', 'png', 'svg', 'webp'];

    // 각 확장자 시도
    const tryLoadImage = async () => {
      for (const ext of extensions) {
        const url = `${baseUrl}/${tickerUpper}/${tickerUpper}.${ext}`;
        console.log(`🔍 시도: ${url}`);

        try {
          // 이미지 로드 테스트
          const img = new Image();
          const loadPromise = new Promise((resolve, reject) => {
            img.onload = () => resolve(url);
            img.onerror = reject;
            img.src = url;
          });

          const loadedUrl = await loadPromise;
          console.log(`✅ 성공: ${loadedUrl}`);
          setImageUrl(loadedUrl);
          setIsLoading(false);
          return;
        } catch (error) {
          console.log(`❌ 실패: ${url}`);
          continue;
        }
      }

      // 모든 확장자 실패
      console.log(`⚠️ ${ticker}: 이미지를 찾을 수 없음`);
      setHasError(true);
      setIsLoading(false);
    };

    tryLoadImage();
  }, [ticker, platform, logo]);

  if (isLoading) {
    return (
      <div className="project-image-placeholder loading" style={{ width: size, height: size }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (hasError || !imageUrl) {
    return (
      <div className="project-image-placeholder" style={{ width: size, height: size }}>
        {ticker ? ticker.charAt(0).toUpperCase() : '?'}
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={`${ticker} logo`}
      className="project-image"
      style={{ width: size, height: size }}
    />
  );
}

export default ProjectImage;
