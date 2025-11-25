// 링크 미리보기 유틸리티 함수

/**
 * 링크에서 미리보기 데이터 가져오기
 * @param {string} url - 미리보기를 가져올 URL
 * @returns {Promise<Object>} 미리보기 데이터
 */
export const getLinkPreview = async (url) => {
  if (!url) return null;

  try {
    // Twitter/X 링크인지 확인
    const twitterPattern = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[\w\/]+/i;
    if (twitterPattern.test(url)) {
      return await getTwitterPreview(url);
    }

    // 일반 링크의 경우 Open Graph 메타데이터 사용
    return await getOpenGraphPreview(url);
  } catch (error) {
    console.error('링크 미리보기 가져오기 실패:', error);
    return null;
  }
};

/**
 * Twitter/X 링크 미리보기 가져오기
 */
const getTwitterPreview = async (url) => {
  try {
    // FxTwitter API 사용 (더 나은 미리보기 제공)
    const fxTwitterUrl = `https://api.fxtwitter.com/status/${extractTweetId(url)}`;
    
    const response = await fetch(fxTwitterUrl);
    const data = await response.json();
    
    if (data && data.tweet) {
      const tweet = data.tweet;
      return {
        type: 'twitter',
        title: tweet.author?.name || '',
        description: tweet.text || '',
        image: tweet.media?.photos?.[0]?.url || tweet.author?.avatar_url || '',
        url: url,
        author: tweet.author?.name || '',
        authorHandle: tweet.author?.screen_name || '',
        date: tweet.created_at || ''
      };
    }
  } catch (error) {
    console.error('Twitter 미리보기 실패:', error);
  }

  // FxTwitter 실패 시 기본 정보 반환
  return {
    type: 'twitter',
    title: 'Twitter 게시물',
    description: '',
    image: '',
    url: url
  };
};

/**
 * Twitter URL에서 트윗 ID 추출
 */
const extractTweetId = (url) => {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i);
  return match ? match[1] : null;
};

/**
 * Open Graph 메타데이터로 미리보기 가져오기
 */
const getOpenGraphPreview = async (url) => {
  try {
    let html = '';
    
    // 먼저 프록시 없이 직접 시도
    try {
      const directResponse = await fetch(url, {
        mode: 'cors',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      
      if (directResponse.ok) {
        html = await directResponse.text();
      } else {
        throw new Error('Direct fetch failed');
      }
    } catch (directError) {
      // 직접 접근 실패 시 프록시 사용
      console.log('직접 접근 실패, 프록시 사용:', directError);
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const proxyResponse = await fetch(proxyUrl);
      const proxyData = await proxyResponse.json();
      html = proxyData.contents;
    }

    // HTML에서 Open Graph 메타데이터 추출
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const getMetaContent = (property) => {
      const meta = doc.querySelector(`meta[property="${property}"]`) || 
                   doc.querySelector(`meta[name="${property}"]`);
      return meta ? meta.getAttribute('content') : '';
    };

    return {
      type: 'link',
      title: getMetaContent('og:title') || doc.querySelector('title')?.textContent || '',
      description: getMetaContent('og:description') || getMetaContent('description') || '',
      image: getMetaContent('og:image') || '',
      url: url,
      siteName: getMetaContent('og:site_name') || ''
    };
  } catch (error) {
    console.error('Open Graph 미리보기 실패:', error);
    return {
      type: 'link',
      title: '',
      description: '',
      image: '',
      url: url
    };
  }
};

