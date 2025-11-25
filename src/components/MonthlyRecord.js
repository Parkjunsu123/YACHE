import React, { useState, useEffect } from 'react';
import ProjectImage from './ProjectImage';
import ProjectDetailModal from './modals/ProjectDetailModal';
import { getAllDailyCheckData } from '../utils/storage';
import './MonthlyRecord.css';

function MonthlyRecord({ currentMonth, currentYear, savedData }) {
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectEntries, setProjectEntries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    calculateMonthlyStats();
  }, [currentMonth, currentYear, savedData]);

  const calculateMonthlyStats = () => {
    const allData = getAllDailyCheckData();
    const projectCounts = {};

    // 현재 월의 데이터만 필터링
    Object.keys(allData).forEach((dateString) => {
      const [year, month] = dateString.split('-').map(Number);
      
      if (year === currentYear && month === currentMonth) {
        const dayData = allData[dateString];
        
        // 배열인지 확인
        if (Array.isArray(dayData)) {
          dayData.forEach((entry) => {
            if (entry.project) {
              const ticker = entry.project.ticker;
              const name = entry.project.name;
              const logo = entry.project.logo;
              
              if (!projectCounts[ticker]) {
                projectCounts[ticker] = {
                  name,
                  ticker,
                  logo,
                  count: 0
                };
              }
              projectCounts[ticker].count += 1;
            }
          });
        }
      }
    });

    // 배열로 변환하고 카운트 순으로 정렬
    const statsArray = Object.values(projectCounts).sort((a, b) => b.count - a.count);
    setMonthlyStats(statsArray);
  };

  // 프로젝트 클릭 핸들러
  const handleProjectClick = (stat) => {
    const allData = getAllDailyCheckData();
    const entries = [];

    // 현재 월의 데이터에서 해당 프로젝트만 필터링
    Object.keys(allData).forEach((dateString) => {
      const [year, month] = dateString.split('-').map(Number);
      
      if (year === currentYear && month === currentMonth) {
        const dayData = allData[dateString];
        
        if (Array.isArray(dayData)) {
          dayData.forEach((entry) => {
            if (entry.project && entry.project.ticker === stat.ticker) {
              entries.push({
                date: dateString,
                link: entry.xPostLink
              });
            }
          });
        }
      }
    });

    setSelectedProject({
      name: stat.name,
      ticker: stat.ticker,
      logo: stat.logo
    });
    setProjectEntries(entries);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    setProjectEntries([]);
  };

  return (
    <div className="monthly-record-container">
      <div className="monthly-record-header">
        <h2>
          {currentYear}년 {currentMonth}월 기록
        </h2>
      </div>

      <div className="monthly-record-body">
        {monthlyStats.length === 0 ? (
          <div className="no-records">
            <p>이번 달 등록된 프로젝트가 없습니다.</p>
          </div>
        ) : (
          <div className="monthly-stats-list">
            {monthlyStats.map((stat, index) => (
              <div 
                key={stat.ticker} 
                className="stat-item"
                onClick={() => handleProjectClick(stat)}
              >
                <div className="stat-rank">{index + 1}</div>
                <div className="stat-project">
                  <ProjectImage 
                    ticker={stat.ticker}
                    platform="kaito"
                    size="32px"
                    logo={stat.logo}
                  />
                  <span className="stat-name">{stat.name}</span>
                </div>
                <div className="stat-count">
                  <span className="count-number">{stat.count}</span>
                  <span className="count-label">회</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProjectDetailModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        project={selectedProject}
        entries={projectEntries}
      />
    </div>
  );
}

export default MonthlyRecord;

