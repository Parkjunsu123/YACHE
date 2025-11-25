import React, { useState, useEffect } from 'react';
import ProjectImage from './ProjectImage';
import { deleteDailyCheckItem } from '../utils/storage';
import './Calendar.css';

function Calendar({ 
  onDateClick,
  savedData = {},
  onDelete,
  onMonthChange
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showingLinkId, setShowingLinkId] = useState(null);

  // 초기 마운트 시 현재 월 알림
  useEffect(() => {
    if (onMonthChange) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      onMonthChange(year, month);
    }
  }, []);

  // 현재 월의 정보
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 월의 첫날과 마지막날
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 이전 달 마지막날
  const prevLastDay = new Date(year, month, 0);

  // 시작 요일 (0: 일요일)
  const firstDayOfWeek = firstDay.getDay();
  
  // 이번 달 일수
  const daysInMonth = lastDay.getDate();
  
  // 이전 달 표시할 일수
  const prevDaysCount = firstDayOfWeek;

  // 다음 달 표시할 일수
  const nextDaysCount = 6 * 7 - (prevDaysCount + daysInMonth);

  // 오늘 날짜
  const today = new Date();
  const isToday = (day) => {
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
  };

  // 이전 달로 이동
  const prevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    setShowingLinkId(null);
    
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth() + 1);
    }
  };

  // 다음 달로 이동
  const nextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrentDate(newDate);
    setShowingLinkId(null);
    
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth() + 1);
    }
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (day, isCurrentMonth, event) => {
    // 심볼 클릭이 아닌 경우에만
    if (!event.target.closest('.project-symbol')) {
      if (isCurrentMonth && onDateClick) {
        const clickedDate = new Date(year, month, day);
        onDateClick(clickedDate);
      }
    }
  };

  // 심볼 클릭 핸들러
  const handleSymbolClick = (event, dateString, item) => {
    event.stopPropagation();
    
    // 이미 링크가 표시되고 있는 항목을 다시 클릭하면 삭제
    if (showingLinkId === item.id) {
      if (window.confirm('이 항목을 삭제하시겠습니까?')) {
        deleteDailyCheckItem(dateString, item.id);
        setShowingLinkId(null);
        if (onDelete) {
          onDelete();
        }
      }
    } else {
      // 링크 표시
      setShowingLinkId(item.id);
    }
  };

  // 저장된 프로젝트 목록 가져오기 (배열)
  const getSavedProjects = (day) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return savedData[dateString] || [];
  };

  // 캘린더 날짜 배열 생성
  const calendarDays = [];

  // 이전 달 날짜들
  for (let i = prevDaysCount - 1; i >= 0; i--) {
    const day = prevLastDay.getDate() - i;
    calendarDays.push({
      day,
      type: 'prev',
      isPrev: true
    });
  }

  // 이번 달 날짜들
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarDays.push({
      day,
      type: 'current',
      isToday: isToday(day),
      projects: getSavedProjects(day),
      dateString
    });
  }

  // 다음 달 날짜들
  for (let day = 1; day <= nextDaysCount; day++) {
    calendarDays.push({
      day,
      type: 'next',
      isNext: true
    });
  }

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="calendar">
      {/* 캘린더 헤더 */}
      <div className="calendar-header">
        <button className="nav-btn" onClick={prevMonth}>
          ◀
        </button>
        <h3 className="calendar-title">
          {year}년 {monthNames[month]}
        </h3>
        <button className="nav-btn" onClick={nextMonth}>
          ▶
        </button>
      </div>

      {/* 요일 표시 */}
      <div className="calendar-weekdays">
        {weekDays.map((day, index) => (
          <div 
            key={day} 
            className={`weekday ${index === 0 ? 'sunday' : ''} ${index === 6 ? 'saturday' : ''}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 표시 */}
      <div className="calendar-days">
        {calendarDays.map((dateObj, index) => (
          <div
            key={index}
            className={`calendar-day 
              ${dateObj.isPrev || dateObj.isNext ? 'other-month' : ''} 
              ${dateObj.isToday ? 'today' : ''} 
              ${index % 7 === 0 ? 'sunday' : ''}
              ${index % 7 === 6 ? 'saturday' : ''}
              ${dateObj.projects && dateObj.projects.length > 0 ? 'has-project' : ''}
            `}
            onClick={(e) => handleDateClick(dateObj.day, dateObj.type === 'current', e)}
          >
            <span className="day-number">{dateObj.day}</span>
            
            {/* More 아이콘 (우측 상단, 3개 이상 등록 시) */}
            {dateObj.projects && dateObj.projects.length >= 3 && (
              <div 
                className="more-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  const clickedDate = new Date(year, month, dateObj.day);
                  onDateClick(clickedDate, true);
                }}
              >
                ⋯
              </div>
            )}
            
            {/* 프로젝트 심볼들 표시 (좌측 하단, 최대 3개) */}
            {dateObj.projects && dateObj.projects.length > 0 && (
              <div className="project-symbols">
                {dateObj.projects.slice(0, 3).map((item) => (
                  <div 
                    key={item.id}
                    className="project-symbol"
                    onClick={(e) => handleSymbolClick(e, dateObj.dateString, item)}
                  >
                    <ProjectImage 
                      ticker={item.project.ticker}
                      platform="kaito"
                      size="24px"
                      logo={item.project.logo}
                    />
                    
                    {/* 링크 툴팁 */}
                    {showingLinkId === item.id && item.xPostLink && (
                      <div className="link-tooltip">
                        <a 
                          href={item.xPostLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          X 포스팅 링크
                        </a>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* 3개 초과 시 +N 표시 */}
                {dateObj.projects.length > 3 && (
                  <div className="more-indicator">
                    +{dateObj.projects.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;
