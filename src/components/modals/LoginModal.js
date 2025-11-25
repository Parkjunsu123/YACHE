import React, { useEffect, useRef, useState } from 'react';
import { saveUserProfile, getUserProfileByHandle } from '../../utils/firestore';
import { setUserSession } from '../../utils/storage';
import '../Modal.css';

const isValidHandle = (handle) => /^@[\w.]{2,}$/i.test(handle.trim());
const isValidCode = (code) => /^[A-Za-z0-9]{4}$/.test(code);

const hashText = async (text) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

function LoginModal({ isOpen, onClose, onSuccess }) {
  const [twitterHandle, setTwitterHandle] = useState('@');
  const [userCode, setUserCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const codeInputRef = useRef(null);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const handleCodeChange = (value) => {
    const sanitized = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
    setUserCode(sanitized);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 150);
    } else {
      setTwitterHandle('@');
      setUserCode('');
      setError('');
      setLoading(false);
      setIsCapsLockOn(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidHandle(twitterHandle)) {
      setError('트위터 닉네임은 @로 시작하고 3자 이상이어야 합니다.');
      return;
    }

    if (!isValidCode(userCode)) {
      setError('사용자 설정 4자리는 영문/숫자 4자리여야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const normalizedHandle = twitterHandle.trim();
      const codeHash = await hashText(userCode.toUpperCase());
      const existingProfile = await getUserProfileByHandle(normalizedHandle);

      if (existingProfile) {
        if (existingProfile.codeHash !== codeHash) {
          setError('등록된 비밀번호와 일치하지 않습니다.');
          setLoading(false);
          return;
        }
      } else {
        await saveUserProfile({
          twitterHandle: normalizedHandle,
          codeHash
        });
      }

      const sessionData = {
        twitterHandle: normalizedHandle
      };
      setUserSession(sessionData);
      if (onSuccess) {
        onSuccess(sessionData);
      }
    } catch (err) {
      console.error(err);
      setError('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>로그인</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="twitterHandle">트위터 닉네임 (@포함)</label>
            <input
              id="twitterHandle"
              type="text"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value)}
              placeholder="@yache"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="userCode">사용자 설정 4자리 (영문/숫자)</label>
            <div
              className="pin-input-wrapper"
              onClick={() => codeInputRef.current?.focus()}
            >
              <div className="pin-circles">
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className={`pin-circle ${userCode.length > index ? 'filled' : ''}`}
                  />
                ))}
              </div>
              <input
                id="userCode"
                ref={codeInputRef}
                type="text"
                value={userCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyDown={(e) => setIsCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'))}
                onKeyUp={(e) => setIsCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'))}
                onFocus={(e) => setIsCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'))}
                onBlur={() => setIsCapsLockOn(false)}
                maxLength={4}
                autoComplete="off"
                className="pin-hidden-input"
                inputMode="text"
                spellCheck="false"
                autoCapitalize="characters"
                aria-label="사용자 설정 4자리"
                required
              />
            </div>
            {isCapsLockOn && (
              <div className="capslock-indicator">
                CAPS LOCK이 켜져 있습니다.
              </div>
            )}
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? '저장 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;

