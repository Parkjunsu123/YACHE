import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import LoginModal from './modals/LoginModal';
import { getUserSession, setUserSession, clearUserSession } from '../utils/storage';
import './Header.css';

function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userSession, setUserSessionState] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const session = getUserSession();
    if (session) {
      setUserSessionState(session);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLoginSuccess = (sessionData) => {
    setUserSession(sessionData);
    setUserSessionState(sessionData);
    window.dispatchEvent(new Event('user-session-changed'));
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    clearUserSession();
    setUserSessionState(null);
    setIsMenuOpen(false);
    window.dispatchEvent(new Event('user-session-changed'));
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* 로고 */}
        <div className="logo">
          <Link to="/">
            <h1>Yache</h1>
          </Link>
        </div>
        
        {/* 중앙 네비게이션 메뉴 */}
        <nav className="nav">
          <ul className="nav-list">
            <li><Link to="/">데일리 체크</Link></li>
            <li><Link to="/posting">포스팅 체크</Link></li>
            <li><Link to="/mutual">상호 체크</Link></li>
          </ul>
        </nav>
        
        {/* 로그인 / 사용자 정보 */}
        <div className="auth">
          {userSession ? (
            <div className="user-menu" ref={menuRef}>
              <button
                className="user-handle-btn"
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                {userSession.twitterHandle}
              </button>
              {isMenuOpen && (
                <div className="user-dropdown">
                  <button className="dropdown-item">
                    마이페이지
                  </button>
                  <button className="dropdown-item" onClick={handleLogout}>
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="login-btn" onClick={() => setIsLoginModalOpen(true)}>
              로그인
            </button>
          )}
        </div>
      </div>
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </header>
  );
}

export default Header;
