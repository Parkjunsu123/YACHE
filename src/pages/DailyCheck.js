import React, { useState, useEffect } from 'react';
import Calendar from '../components/Calendar';
import Modal from '../components/modals/Modal';
import ListModal from '../components/modals/ListModal';
import TierList from '../components/TierList';
import MonthlyRecord from '../components/MonthlyRecord';
import { getAllDailyCheckData, getDailyCheckData } from '../utils/storage';
import './DailyCheck.css';

function DailyCheck() {
  // 쿠키에서 저장된 데이터 로드
  const [savedData, setSavedData] = useState({});
  
  // 현재 월/년 상태 (캘린더 기준)
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  
  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateItems, setSelectedDateItems] = useState([]);

  // 컴포넌트 마운트 시 쿠키에서 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  // 데이터 로드 함수
  const loadData = () => {
    const data = getAllDailyCheckData();
    setSavedData(data);
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (date, showList = false) => {
    setSelectedDate(date);
    
    if (showList) {
      // More 아이콘 클릭 - 리스트 모달 열기
      const dateString = formatDateString(date);
      const items = getDailyCheckData(dateString);
      setSelectedDateItems(items);
      setIsListModalOpen(true);
    } else {
      // 일반 날짜 클릭 - 등록 모달 열기
      setIsModalOpen(true);
    }
  };

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const formatDateString = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  // 리스트 모달 닫기
  const closeListModal = () => {
    setIsListModalOpen(false);
    setSelectedDate(null);
    setSelectedDateItems([]);
  };

  // 저장 후 콜백
  const handleSave = () => {
    loadData(); // 데이터 다시 로드
  };

  // 항목 삭제/수정 후 콜백
  const handleUpdate = () => {
    loadData(); // 데이터 다시 로드
    // 리스트 모달 업데이트
    if (selectedDate) {
      const dateString = formatDateString(selectedDate);
      const items = getDailyCheckData(dateString);
      setSelectedDateItems(items);
      
      // 항목이 없으면 모달 닫기
      if (items.length === 0) {
        closeListModal();
      }
    }
  };

  // 월 변경 핸들러
  const handleMonthChange = (year, month) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  return (
    <div className="daily-check">
      <div className="daily-check-layout">
        <div className="daily-check-left">
          <Calendar 
            onDateClick={handleDateClick}
            savedData={savedData}
            onDelete={handleSave}
            onMonthChange={handleMonthChange}
          />
        </div>
        <div className="daily-check-right">
          <TierList />
          <MonthlyRecord 
            currentMonth={currentMonth}
            currentYear={currentYear}
            savedData={savedData}
          />
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen}
        onClose={closeModal}
        date={selectedDate}
        onSave={handleSave}
      />

      <ListModal 
        isOpen={isListModalOpen}
        onClose={closeListModal}
        date={selectedDate}
        items={selectedDateItems}
        onUpdate={handleUpdate}
      />
    </div>
  );
}

export default DailyCheck;
