import React from 'react';
import ProjectImage from '../components/ProjectImage';
import './TestPage.css';

function TestPage() {
  const testProjects = [
    { name: 'TRIA', ticker: 'TRIA' },
    { name: 'Irys', ticker: 'IRYS' },
    { name: 'Openmind', ticker: 'OPENMIND' }
  ];

  return (
    <div className="test-page">
      <div className="test-container">
        <h2>프로젝트 이미지 테스트</h2>
        <p className="test-description">Kaito S3에서 프로젝트 로고를 가져오는 테스트 페이지입니다.</p>

        <div className="test-grid">
          {testProjects.map((project) => (
            <div key={project.ticker} className="test-item">
              <ProjectImage 
                ticker={project.ticker}
                platform="kaito"
                size="60px"
              />
              <div className="test-item-info">
                <div className="test-item-name">{project.name}</div>
                <div className="test-item-ticker">{project.ticker}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="test-info">
          <h3>테스트 정보</h3>
          <ul>
            <li>✅ 이미지가 표시되면: Kaito S3에서 성공적으로 로드됨</li>
            <li>⏳ 로딩 스피너가 보이면: 이미지를 찾는 중</li>
            <li>🔤 첫 글자만 보이면: 이미지를 찾지 못함 (폴백 상태)</li>
          </ul>
          <p className="test-note">
            <strong>참고:</strong> TRIA, SOL, ETH, BTC 등은 실제 Kaito S3에 존재하는 프로젝트입니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TestPage;

