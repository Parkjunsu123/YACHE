import React, { useState, useEffect } from 'react';
import ProjectImage from './ProjectImage';
import { getAllProjects } from '../data/projects';
import { getCookie, setCookie } from '../utils/storage';
import './TierList.css';

function TierList() {
  const [activeTab, setActiveTab] = useState('티어표');
  const [tiers, setTiers] = useState({
    S: [],
    A: [],
    B: [],
    C: [],
    D: []
  });
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showTierSelector, setShowTierSelector] = useState(false);
  const [selectedTier, setSelectedTier] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedFromTier, setDraggedFromTier] = useState(null);

  // 티어 데이터 로드
  useEffect(() => {
    const savedTiers = getCookie('projectTiers');
    if (savedTiers) {
      setTiers(savedTiers);
    }
  }, []);

  // Todo 데이터 로드
  useEffect(() => {
    const savedTodos = getCookie('projectTodos');
    if (savedTodos) {
      setTodos(savedTodos);
    }
  }, []);

  // 티어 데이터 저장
  const saveTiers = (newTiers) => {
    setTiers(newTiers);
    setCookie('projectTiers', newTiers);
  };

  // Todo 데이터 저장
  const saveTodos = (newTodos) => {
    setTodos(newTodos);
    setCookie('projectTodos', newTodos);
  };

  // 티어 선택 모달 열기
  const handleMainAddClick = () => {
    setShowTierSelector(true);
  };

  // 프로젝트 추가 모달 열기
  const handleTierSelect = (tier) => {
    setSelectedTier(tier);
    setShowTierSelector(false);
    setShowProjectSelector(true);
  };

  // 프로젝트 추가
  const handleProjectSelect = (project) => {
    // 이미 티어에 있는지 확인
    const isAlreadyInTier = Object.values(tiers).some(tierProjects => 
      tierProjects.some(p => p.ticker === project.ticker)
    );

    if (isAlreadyInTier) {
      alert('이미 티어표에 추가된 프로젝트입니다.');
      return;
    }

    const newTiers = {
      ...tiers,
      [selectedTier]: [...tiers[selectedTier], project]
    };
    saveTiers(newTiers);
    setShowProjectSelector(false);
  };

  // 프로젝트 삭제
  const handleRemoveProject = (tier, ticker) => {
    const newTiers = {
      ...tiers,
      [tier]: tiers[tier].filter(p => p.ticker !== ticker)
    };
    saveTiers(newTiers);
  };

  // 드래그 시작
  const handleDragStart = (e, project, fromTier) => {
    setDraggedItem(project);
    setDraggedFromTier(fromTier);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 드래그 오버
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 드롭
  const handleDrop = (e, toTier) => {
    e.preventDefault();
    
    if (!draggedItem || !draggedFromTier) return;

    // 같은 티어면 무시
    if (draggedFromTier === toTier) {
      setDraggedItem(null);
      setDraggedFromTier(null);
      return;
    }

    // 원래 티어에서 제거하고 새 티어에 추가
    const newTiers = {
      ...tiers,
      [draggedFromTier]: tiers[draggedFromTier].filter(p => p.ticker !== draggedItem.ticker),
      [toTier]: [...tiers[toTier], draggedItem]
    };

    saveTiers(newTiers);
    setDraggedItem(null);
    setDraggedFromTier(null);
  };

  const tierColors = {
    S: '#ff6b6b',
    A: '#ffa94d',
    B: '#ffd93d',
    C: '#6bcf7f',
    D: '#4dabf7'
  };

  // Todo 추가
  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const todo = {
        id: Date.now(),
        text: newTodo.trim()
      };
      saveTodos([...todos, todo]);
      setNewTodo('');
    }
  };

  // Todo 삭제 (한번 클릭)
  const handleDeleteTodo = (id) => {
    saveTodos(todos.filter(t => t.id !== id));
  };

  const allProjects = getAllProjects();

  return (
    <div className="tier-list-container">
      {/* 탭 */}
      <div className="tier-list-tabs">
        <button
          className={`tier-tab ${activeTab === '티어표' ? 'active' : ''}`}
          onClick={() => setActiveTab('티어표')}
        >
          티어표
        </button>
        <button
          className={`tier-tab ${activeTab === '할일' ? 'active' : ''}`}
          onClick={() => setActiveTab('할일')}
        >
          할일
        </button>
      </div>

      {activeTab === '티어표' && (
        <>
          <div className="tier-list-body">
            {['S', 'A', 'B', 'C', 'D'].map((tier) => (
              <div
                key={tier}
                className="tier-row"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, tier)}
              >
                <div 
                  className="tier-label" 
                  style={{ backgroundColor: tierColors[tier] }}
                >
                  {tier}
                </div>
                <div className="tier-content">
                  <div className="tier-projects">
                    {tiers[tier].map((project) => (
                      <div
                        key={project.ticker}
                        className="tier-project"
                        draggable
                        onDragStart={(e) => handleDragStart(e, project, tier)}
                      >
                        <ProjectImage 
                          ticker={project.ticker}
                          platform="kaito"
                          size="32px"
                          logo={project.logo}
                        />
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveProject(tier, project.ticker)}
                          title="제거"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 전체 추가 버튼 */}
          <button
            className="main-add-btn"
            onClick={handleMainAddClick}
            title="프로젝트 추가"
          >
            +
          </button>
        </>
      )}

      {activeTab === '할일' && (
        <div className="todo-list-body">
          <div className="todo-input-section">
            <input
              type="text"
              className="todo-input"
              placeholder="할일을 입력하세요..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
            />
            <button className="todo-add-btn" onClick={handleAddTodo}>
              추가
            </button>
          </div>
          <div className="todo-list">
            {todos.length === 0 ? (
              <div className="todo-empty">할일이 없습니다.</div>
            ) : (
              todos.map(todo => (
                <div
                  key={todo.id}
                  className="todo-item"
                  onClick={() => handleDeleteTodo(todo.id)}
                >
                  <span className="todo-text">{todo.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 티어 선택 모달 */}
      {showTierSelector && (
        <div className="tier-modal-overlay" onClick={() => setShowTierSelector(false)}>
          <div className="tier-selector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tier-modal-header">
              <h3>등급 선택</h3>
              <button 
                className="tier-modal-close"
                onClick={() => setShowTierSelector(false)}
              >
                ×
              </button>
            </div>
            <div className="tier-selector-body">
              {['S', 'A', 'B', 'C', 'D'].map((tier) => (
                <button
                  key={tier}
                  className="tier-selector-btn"
                  style={{ backgroundColor: tierColors[tier] }}
                  onClick={() => handleTierSelect(tier)}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 프로젝트 선택 모달 */}
      {showProjectSelector && (
        <div className="tier-modal-overlay" onClick={() => setShowProjectSelector(false)}>
          <div className="tier-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="tier-modal-header">
              <h3>{selectedTier}등급에 추가할 프로젝트 선택</h3>
              <button 
                className="tier-modal-close"
                onClick={() => setShowProjectSelector(false)}
              >
                ×
              </button>
            </div>
            <div className="tier-modal-body">
              <div className="tier-project-grid">
                {allProjects
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((project) => {
                    const isInTier = Object.values(tiers).some(tierProjects => 
                      tierProjects.some(p => p.ticker === project.ticker)
                    );
                    
                    return (
                      <div
                        key={project.ticker}
                        className={`tier-project-option ${isInTier ? 'disabled' : ''}`}
                        onClick={() => !isInTier && handleProjectSelect(project)}
                      >
                        <ProjectImage 
                          ticker={project.ticker}
                          platform="kaito"
                          size="40px"
                          logo={project.logo}
                        />
                        <span className="tier-project-name">{project.name}</span>
                        {isInTier && <span className="in-tier-badge">등록됨</span>}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TierList;

