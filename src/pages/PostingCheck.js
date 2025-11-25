import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SavePostingModal from '../components/modals/SavePostingModal';
import LoadPostingModal from '../components/modals/LoadPostingModal';
import './PostingCheck.css';

function PostingCheck() {
  const [jsonInput, setJsonInput] = useState('');
  const [tableData, setTableData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

  // 좋아요 상태 로드
  const handleAnalyze = () => {
    try {
      setError('');
      const parsed = JSON.parse(jsonInput);
      
      // documents 배열 추출
      const documents = parsed.documents || [];
      
      if (documents.length === 0) {
        setError('documents 배열을 찾을 수 없습니다.');
        setTableData(null);
        return;
      }

      // 데이터 정렬 및 포맷팅
      const formattedRows = documents.map((doc, index) => {
        const author = doc.twitter_tweet_author_detail || {};
        const sentiment = doc.ticker_sentiment || {};
        const llmScore = doc.llm_relevance_score || {};
        
        return {
          rank: index + 1,
          created_at: doc.created_at,
          user_name: author.twitter_user_name || '',
          user_username: author.twitter_user_username || '',
          user_profile_image: author.twitter_user_profile_image_url || '',
          score: doc.rank_score || 0,
          content: doc.twitter_tweet_text || '',
          url: doc.url || '',
          total: doc.engagement_count || 0,
          likes: doc.twitter_tweet_like_count || 0,
          retweets: doc.twitter_tweet_retweet_count || 0,
          replies: doc.twitter_tweet_reply_count || 0,
          quotes: doc.twitter_tweet_quote_count || 0,
          bookmarks: doc.twitter_tweet_bookmark_count || 0,
          views: doc.twitter_tweet_view_count || 0,
          sentiment: Object.values(sentiment)[0] || '',
          llmRel: Object.values(llmScore)[0] || '',
          smart: doc.twitter_kkol_engagement_count_ranking || ''
        };
      });

      const sortedRows = [...formattedRows].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        if (sortConfig.direction === 'asc') {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });

      setOriginalData({
        rows: sortedRows
      });
      setTableData({
        rows: sortedRows
      });
    } catch (err) {
      setError('JSON 파싱 오류: ' + err.message);
      setTableData(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  const handleSort = (key) => {
    const newDirection =
      sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    setSortConfig({ key, direction: newDirection });

    if (tableData && tableData.rows) {
      const sortedRows = [...tableData.rows].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return newDirection === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        if (newDirection === 'asc') {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });

      setTableData({
        rows: sortedRows
      });
    }
  };

  const getTotalColor = (total) => {
    if (total >= 200) return 'green';
    if (total >= 100) return 'orange';
    return 'gray';
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!originalData || !originalData.rows) return;
    
    if (!query.trim()) {
      setTableData(originalData);
      return;
    }

    const filteredRows = originalData.rows.filter(row => {
      const userName = (row.user_name || '').toLowerCase();
      const userUsername = (row.user_username || '').toLowerCase();
      const searchLower = query.toLowerCase();
      
      return userName.includes(searchLower) || userUsername.includes(searchLower);
    });

    setTableData({
      rows: filteredRows
    });
  };

  const handleReset = () => {
    setJsonInput('');
    setTableData(null);
    setOriginalData(null);
    setSearchQuery('');
    setError('');
  };

  // Firebase에서 불러온 데이터를 분석 결과에 적용
  const handleLoadAnalysis = (analysis) => {
    try {
      // 원본 JSON이 있으면 그것을 사용, 없으면 rows로부터 재구성
      if (analysis.originalJson) {
        setJsonInput(analysis.originalJson);
        // JSON을 파싱하여 분석 결과 표시
        const parsed = JSON.parse(analysis.originalJson);
        const documents = parsed.documents || [];
        
        if (documents.length > 0) {
          // 기존 handleAnalyze 로직과 동일하게 처리
          const formattedRows = documents.map((doc, index) => {
            const author = doc.twitter_tweet_author_detail || {};
            const sentiment = doc.ticker_sentiment || {};
            const llmScore = doc.llm_relevance_score || {};
            
            return {
              rank: index + 1,
              created_at: doc.created_at,
              user_name: author.twitter_user_name || '',
              user_username: author.twitter_user_username || '',
              user_profile_image: author.twitter_user_profile_image_url || '',
              score: doc.rank_score || 0,
              content: doc.twitter_tweet_text || '',
              url: doc.url || '',
              total: doc.engagement_count || 0,
              likes: doc.twitter_tweet_like_count || 0,
              retweets: doc.twitter_tweet_retweet_count || 0,
              replies: doc.twitter_tweet_reply_count || 0,
              quotes: doc.twitter_tweet_quote_count || 0,
              bookmarks: doc.twitter_tweet_bookmark_count || 0,
              views: doc.twitter_tweet_view_count || 0,
              sentiment: Object.values(sentiment)[0] || '',
              llmRel: Object.values(llmScore)[0] || '',
              smart: doc.twitter_kkol_engagement_count_ranking || ''
            };
          });

          const sortedRows = [...formattedRows].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (typeof aVal === 'string' && typeof bVal === 'string') {
              return sortConfig.direction === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
            }
            if (sortConfig.direction === 'asc') {
              return aVal > bVal ? 1 : -1;
            }
            return aVal < bVal ? 1 : -1;
          });

          setOriginalData({ rows: sortedRows });
          setTableData({ rows: sortedRows });
          setError('');
        }
      } else if (analysis.rows && analysis.rows.length > 0) {
        // originalJson이 없으면 rows 데이터를 직접 사용
        const sortedRows = [...analysis.rows].sort((a, b) => {
          const aVal = a[sortConfig.key];
          const bVal = b[sortConfig.key];
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortConfig.direction === 'asc'
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          }
          if (sortConfig.direction === 'asc') {
            return aVal > bVal ? 1 : -1;
          }
          return aVal < bVal ? 1 : -1;
        });

        setOriginalData({ rows: sortedRows });
        setTableData({ rows: sortedRows });
        setError('');
      } else {
        setError('불러온 데이터에 분석 결과가 없습니다.');
      }
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다: ' + err.message);
    }
  };

  return (
    <div className="posting-check">
      <div className="page-header">
        <h2>포스팅 체크</h2>
        <Link to="/posting/guide" className="guide-btn">
          가이드 보기
        </Link>
      </div>
      <p>JSON 데이터를 입력하고 분석하기 버튼을 클릭하세요.</p>
      
      <div className="json-input-section">
        <textarea
          className="json-input"
          placeholder="JSON 데이터를 입력하세요..."
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />
        <div className="button-row">
          <div className="button-group">
            <button className="analyze-btn" onClick={handleAnalyze}>
              분석하기
            </button>
            <button className="reset-btn" onClick={handleReset}>
              초기화
            </button>
          </div>
          <button className="load-btn" onClick={() => setIsLoadModalOpen(true)}>
            불러오기
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {tableData && (
        <div className="table-section">
          <div className="table-header">
            <h3>분석 결과 ({tableData.rows.length}개 항목)</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="search-box">
                <input
                  type="text"
                  className="search-input"
                  placeholder="유저명 또는 계정 아이디 검색..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <button 
                className="save-btn" 
                onClick={() => setIsSaveModalOpen(true)}
              >
                저장하기
              </button>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('rank')}>
                    # <span className="sort-icon">↑</span>
                  </th>
                  <th onClick={() => handleSort('created_at')}>
                    작성일 <span className="sort-icon">↑</span>
                  </th>
                  <th onClick={() => handleSort('user_name')}>
                    유저명 <span className="sort-icon">↑</span>
                  </th>
                  <th onClick={() => handleSort('score')}>
                    Score <span className="sort-icon">↑</span>
                  </th>
                  <th>글 내용</th>
                  <th onClick={() => handleSort('total')}>
                    Total <span className="sort-icon">↑</span>
                  </th>
                  <th onClick={() => handleSort('likes')}>
                    ♥ <span className="sort-icon">↑</span>
                  </th>
                  <th onClick={() => handleSort('retweets')}>
                    RT <span className="sort-icon">↑</span>
                  </th>
                  <th onClick={() => handleSort('replies')}>
                    댓글 <span className="sort-icon">↑</span>
                  </th>
                  <th onClick={() => handleSort('quotes')}>
                    인용 <span className="sort-icon">↑</span>
                  </th>
                  <th onClick={() => handleSort('bookmarks')}>
                    북마크 <span className="sort-icon">↑</span>
                  </th>
                  <th onClick={() => handleSort('views')}>
                    조회수 <span className="sort-icon">↑</span>
                  </th>
                  <th onClick={() => handleSort('sentiment')}>
                    Sentiment <span className="sort-icon">↑</span>
                  </th>
                  <th onClick={() => handleSort('llmRel')}>
                    LLM Rel <span className="sort-icon">↑</span>
                  </th>
                  <th onClick={() => handleSort('smart')}>
                    Smart <span className="sort-icon">↑</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td>{row.rank}</td>
                    <td>{formatDate(row.created_at)}</td>
                    <td className="user-cell">
                      {row.user_profile_image && (
                        <img 
                          src={row.user_profile_image} 
                          alt={row.user_name}
                          className="user-avatar"
                        />
                      )}
                      <div className="user-info">
                        <div className="user-name">{row.user_name}</div>
                        <div className="user-username">@{row.user_username}</div>
                      </div>
                    </td>
                    <td className="score-cell">{row.score.toFixed(3)}</td>
                    <td className="content-cell">
                      <div className="content-text">
                        {row.content}
                      </div>
                      {row.url && (
                        <a 
                          href={row.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="tweet-link"
                        >
                          트윗보기
                        </a>
                      )}
                    </td>
                    <td className={`total-cell ${getTotalColor(row.total)}`}>
                      {row.total}
                    </td>
                    <td>{row.likes}</td>
                    <td>{row.retweets}</td>
                    <td>{row.replies}</td>
                    <td>{row.quotes}</td>
                    <td>{row.bookmarks}</td>
                    <td>{row.views}</td>
                    <td>{row.sentiment ? `EVERLYN:${row.sentiment}` : ''}</td>
                    <td>{row.llmRel ? `EVERLYN: ${row.llmRel}` : ''}</td>
                    <td>{row.smart}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SavePostingModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        tableData={tableData}
        originalJson={jsonInput}
      />

      <LoadPostingModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        onLoad={handleLoadAnalysis}
      />
    </div>
  );
}

export default PostingCheck;

