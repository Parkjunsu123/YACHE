import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './PostingCheckGuide.css';

function PostingCheckGuide() {
  const [activeStep, setActiveStep] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const defaultCurlTemplate = '';

  const [curlTemplate, setCurlTemplate] = useState(defaultCurlTemplate);
  const [formData, setFormData] = useState({
    ticker: '',
    userId: '',
    language: 'en',
    size: 20
  });

  const [updatedCurlCommand, setUpdatedCurlCommand] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [windowsCmdFormat, setWindowsCmdFormat] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [showWindowsFormat, setShowWindowsFormat] = useState(false);
  
  // 3단계 상태
  const [rawJsonInput, setRawJsonInput] = useState('');
  const [cleanedJson, setCleanedJson] = useState('');
  const [lineNumbers, setLineNumbers] = useState([]); // 라인 번호 목록
  const [showLineNumbers, setShowLineNumbers] = useState(false); // 라인 번호 표시 여부

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCurlTemplateChange = (e) => {
    setCurlTemplate(e.target.value);
  };

  const updateCurlCommand = () => {
    if (!curlTemplate.trim()) {
      alert('curl 명령어 템플릿을 입력해주세요.');
      return;
    }

    try {
      let updatedCommand = curlTemplate;
      const isWindowsFormat = curlTemplate.includes('^');
      
      console.log('=== curl 명령어 업데이트 디버깅 ===');
      console.log('Windows 형식:', isWindowsFormat);
      console.log('입력된 값들:', formData);
      
      if (isWindowsFormat) {
        // Windows cmd 형식 처리
        const dataRawStartIndex = updatedCommand.indexOf('--data-raw');
        if (dataRawStartIndex === -1) {
          alert('--data-raw 부분을 찾을 수 없습니다.');
          return;
        }
        
        // --data-raw 다음 부분 찾기
        let dataRawStart = updatedCommand.indexOf('^"', dataRawStartIndex);
        if (dataRawStart === -1) {
          dataRawStart = updatedCommand.indexOf('"', dataRawStartIndex);
        }
        
        if (dataRawStart === -1) {
          alert('--data-raw의 JSON 부분을 찾을 수 없습니다.');
          return;
        }
        
        // JSON 끝 부분 찾기 (마지막 ^" 또는 ")
        let dataRawEnd = updatedCommand.lastIndexOf('^"');
        if (dataRawEnd === -1 || dataRawEnd <= dataRawStart) {
          dataRawEnd = updatedCommand.lastIndexOf('"');
        }
        
        if (dataRawEnd === -1 || dataRawEnd <= dataRawStart) {
          alert('--data-raw의 JSON 끝 부분을 찾을 수 없습니다.');
          return;
        }
        
        // JSON 내용 추출 (^" 제외, 원본 형식 유지)
        const jsonStart = dataRawStart + 2; // ^" 건너뛰기
        const jsonEnd = dataRawEnd;
        let dataRawContent = updatedCommand.substring(jsonStart, jsonEnd);
        
        console.log('추출된 JSON 내용 (처음 200자):', dataRawContent.substring(0, 200));
        
        // Windows cmd 형식에서 JSON 내부의 따옴표는 ^\^" 형태
        // 더 유연한 정규식 사용 (공백, 줄바꿈 허용)
        if (formData.ticker) {
          const beforeReplace = dataRawContent;
          // 여러 패턴 시도
          // Windows cmd 형식: ^\^"crypto_ticker^\^":^\^"값^\^"
          // eslint-disable-next-line no-useless-escape
          dataRawContent = dataRawContent.replace(
            /\^\\\^"crypto_ticker\^\\\^"\s*:\s*\^\\\^"[^\^]*\^\\\^"/g,
            `^\\^"crypto_ticker^\\^":^\\^"${formData.ticker}^\\^"`
          );
          // 필드가 없으면 추가
          if (beforeReplace === dataRawContent && !dataRawContent.includes('crypto_ticker')) {
            // 첫 번째 필드 뒤에 추가
            const firstComma = dataRawContent.indexOf(',');
            if (firstComma !== -1) {
              dataRawContent = dataRawContent.substring(0, firstComma) + 
                `,^\\^"crypto_ticker^\\^":^\\^"${formData.ticker}^\\^"` + 
                dataRawContent.substring(firstComma);
            } else {
              // 중괄호 안에 추가
              const firstBrace = dataRawContent.indexOf('{');
              if (firstBrace !== -1) {
                dataRawContent = dataRawContent.substring(0, firstBrace + 1) + 
                  `^\\^"crypto_ticker^\\^":^\\^"${formData.ticker}^\\^"` + 
                  dataRawContent.substring(firstBrace + 1);
              }
            }
          }
          console.log('ticker 교체:', beforeReplace !== dataRawContent ? '성공' : '실패 (필드 없음)');
        }
        
        if (formData.size) {
          const beforeReplace = dataRawContent;
          dataRawContent = dataRawContent.replace(
            /\^\\\^"size\^\\\^"\s*:\s*\d+/g,
            `^\\^"size^\\^":${formData.size}`
          );
          // 필드가 없으면 추가
          if (beforeReplace === dataRawContent && !dataRawContent.includes('"size"')) {
            const firstComma = dataRawContent.indexOf(',');
            if (firstComma !== -1) {
              dataRawContent = dataRawContent.substring(0, firstComma) + 
                `,^\\^"size^\\^":${formData.size}` + 
                dataRawContent.substring(firstComma);
            }
          }
          console.log('size 교체:', beforeReplace !== dataRawContent ? '성공' : '실패 (필드 없음)');
        }
        
        if (formData.language) {
          const beforeReplace = dataRawContent;
          // Windows cmd 형식: ^\^"language^\^":^\^"값^\^"
          // eslint-disable-next-line no-useless-escape
          dataRawContent = dataRawContent.replace(
            /\^\\\^"language\^\\\^"\s*:\s*\^\\\^"[^\^]*\^\\\^"/g,
            `^\\^"language^\\^":^\\^"${formData.language}^\\^"`
          );
          // 필드가 없으면 추가
          if (beforeReplace === dataRawContent && !dataRawContent.includes('language')) {
            const firstComma = dataRawContent.indexOf(',');
            if (firstComma !== -1) {
              dataRawContent = dataRawContent.substring(0, firstComma) + 
                `,^\\^"language^\\^":^\\^"${formData.language}^\\^"` + 
                dataRawContent.substring(firstComma);
            }
          }
          console.log('language 교체:', beforeReplace !== dataRawContent ? '성공' : '실패 (필드 없음)');
        }
        
        // userId는 공란일 때도 처리 (빈 값으로 업데이트)
        if (formData.userId !== undefined && formData.userId !== null) {
          const beforeReplace = dataRawContent;
          // Windows cmd 형식: ^\^"twitter_user_id^\^":^\^"값^\^"
          // eslint-disable-next-line no-useless-escape
          dataRawContent = dataRawContent.replace(
            /\^\\\^"twitter_user_id\^\\\^"\s*:\s*\^\\\^"[^\^]*\^\\\^"/g,
            `^\\^"twitter_user_id^\\^":^\\^"${formData.userId}^\\^"`
          );
          // 필드가 없고 값이 있을 때만 추가 (공란일 때는 추가하지 않음)
          if (beforeReplace === dataRawContent && !dataRawContent.includes('twitter_user_id') && formData.userId && formData.userId.trim() !== '') {
            const firstComma = dataRawContent.indexOf(',');
            if (firstComma !== -1) {
              dataRawContent = dataRawContent.substring(0, firstComma) + 
                `,^\\^"twitter_user_id^\\^":^\\^"${formData.userId}^\\^"` + 
                dataRawContent.substring(firstComma);
            }
          }
          console.log('userId 교체:', beforeReplace !== dataRawContent ? '성공' : '실패 (필드 없음)');
        }
        
        // 원본 형식 유지하면서 교체
        updatedCommand = updatedCommand.substring(0, jsonStart) + dataRawContent + updatedCommand.substring(jsonEnd);
      } else {
        // 일반 형식 처리 (여러 줄 처리 가능)
        const dataRawStartIndex = updatedCommand.indexOf('--data-raw');
        if (dataRawStartIndex === -1) {
          alert('--data-raw 부분을 찾을 수 없습니다.');
          return;
        }
        
        // --data-raw 다음 부분 찾기 (작은따옴표 또는 큰따옴표)
        let dataRawStart = updatedCommand.indexOf("'", dataRawStartIndex);
        let quoteChar = "'";
        if (dataRawStart === -1) {
          dataRawStart = updatedCommand.indexOf('"', dataRawStartIndex);
          quoteChar = '"';
        }
        
        if (dataRawStart === -1) {
          alert('--data-raw의 JSON 부분을 찾을 수 없습니다.');
          return;
        }
        
        // JSON 끝 부분 찾기 (마지막 따옴표)
        let dataRawEnd = updatedCommand.lastIndexOf(quoteChar);
        if (dataRawEnd === -1 || dataRawEnd <= dataRawStart) {
          alert('--data-raw의 JSON 끝 부분을 찾을 수 없습니다.');
          return;
        }
        
        // JSON 내용 추출 (따옴표 제외)
        const jsonStart = dataRawStart + 1;
        const jsonEnd = dataRawEnd;
        let dataRawContent = updatedCommand.substring(jsonStart, jsonEnd);
        
        console.log('추출된 JSON 내용 (처음 200자):', dataRawContent.substring(0, 200));
        
        // JSON 문자열 내부의 값만 수정 (더 유연한 정규식 사용)
        if (formData.ticker) {
          const beforeReplace = dataRawContent;
          // 여러 패턴 시도 (공백, 줄바꿈 허용)
          dataRawContent = dataRawContent.replace(
            /"crypto_ticker"\s*:\s*"[^"]*"/g,
            `"crypto_ticker":"${formData.ticker}"`
          );
          // 필드가 없으면 추가
          if (beforeReplace === dataRawContent && !dataRawContent.includes('crypto_ticker')) {
            const firstComma = dataRawContent.indexOf(',');
            if (firstComma !== -1) {
              dataRawContent = dataRawContent.substring(0, firstComma) + 
                `,"crypto_ticker":"${formData.ticker}"` + 
                dataRawContent.substring(firstComma);
            } else {
              const firstBrace = dataRawContent.indexOf('{');
              if (firstBrace !== -1) {
                dataRawContent = dataRawContent.substring(0, firstBrace + 1) + 
                  `"crypto_ticker":"${formData.ticker}"` + 
                  dataRawContent.substring(firstBrace + 1);
              }
            }
          }
          console.log('ticker 교체:', beforeReplace !== dataRawContent ? '성공' : '실패 (필드 없음)');
        }
        
        if (formData.size) {
          const beforeReplace = dataRawContent;
          dataRawContent = dataRawContent.replace(
            /"size"\s*:\s*\d+/g,
            `"size":${formData.size}`
          );
          // 필드가 없으면 추가
          if (beforeReplace === dataRawContent && !dataRawContent.includes('"size"')) {
            const firstComma = dataRawContent.indexOf(',');
            if (firstComma !== -1) {
              dataRawContent = dataRawContent.substring(0, firstComma) + 
                `,"size":${formData.size}` + 
                dataRawContent.substring(firstComma);
            }
          }
          console.log('size 교체:', beforeReplace !== dataRawContent ? '성공' : '실패 (필드 없음)');
        }
        
        if (formData.language) {
          const beforeReplace = dataRawContent;
          dataRawContent = dataRawContent.replace(
            /"language"\s*:\s*"[^"]*"/g,
            `"language":"${formData.language}"`
          );
          // 필드가 없으면 추가
          if (beforeReplace === dataRawContent && !dataRawContent.includes('language')) {
            const firstComma = dataRawContent.indexOf(',');
            if (firstComma !== -1) {
              dataRawContent = dataRawContent.substring(0, firstComma) + 
                `,"language":"${formData.language}"` + 
                dataRawContent.substring(firstComma);
            }
          }
          console.log('language 교체:', beforeReplace !== dataRawContent ? '성공' : '실패 (필드 없음)');
        }
        
        // userId는 공란일 때도 처리 (빈 값으로 업데이트)
        if (formData.userId !== undefined && formData.userId !== null) {
          const beforeReplace = dataRawContent;
          dataRawContent = dataRawContent.replace(
            /"twitter_user_id"\s*:\s*"[^"]*"/g,
            `"twitter_user_id":"${formData.userId}"`
          );
          // 필드가 없고 값이 있을 때만 추가 (공란일 때는 추가하지 않음)
          if (beforeReplace === dataRawContent && !dataRawContent.includes('twitter_user_id') && formData.userId && formData.userId.trim() !== '') {
            const firstComma = dataRawContent.indexOf(',');
            if (firstComma !== -1) {
              dataRawContent = dataRawContent.substring(0, firstComma) + 
                `,"twitter_user_id":"${formData.userId}"` + 
                dataRawContent.substring(firstComma);
            }
          }
          console.log('userId 교체:', beforeReplace !== dataRawContent ? '성공' : '실패 (필드 없음)');
        }
        
        // 원본 형식 유지하면서 교체
        updatedCommand = updatedCommand.substring(0, jsonStart) + dataRawContent + updatedCommand.substring(jsonEnd);
      }
      
      console.log('최종 업데이트된 명령어 (처음 300자):', updatedCommand.substring(0, 300));
      
      setUpdatedCurlCommand(updatedCommand);
      setWindowsCmdFormat(updatedCommand);
      setShowWindowsFormat(isWindowsFormat);
    } catch (error) {
      alert('명령어 업데이트 중 오류가 발생했습니다: ' + error.message);
      console.error(error);
    }
  };

  const resetCurlTemplate = () => {
    setCurlTemplate(defaultCurlTemplate);
    setUpdatedCurlCommand('');
    setWindowsCmdFormat('');
    setShowWindowsFormat(false);
  };

  const resetJsonInput = () => {
    setRawJsonInput('');
    setCleanedJson('');
    setLineNumbers([]);
    setShowLineNumbers(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('클립보드에 복사되었습니다!');
    }).catch(err => {
      console.error('복사 실패:', err);
      alert('복사에 실패했습니다.');
    });
  };

  const downloadJson = () => {
    if (!cleanedJson) {
      alert('다운로드할 JSON이 없습니다.');
      return;
    }

    const blob = new Blob([cleanedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned-json.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 라인 번호 찾기 함수
  const findLineNumbers = (text) => {
    // 모든 라인 번호 및 프롬프트 패턴 찾기 (더 포괄적으로)
    const allPatterns = [
      // 기본 라인 번호 패턴
      { pattern: /L\d{1,6}:/g, type: 'lineNumber', name: 'L123:' },
      { pattern: /L\d{1,6}:\s*/g, type: 'lineNumber', name: 'L123: (공백 포함)' },
      // 숫자만 있는 라인 번호 (콜론 뒤에 공백이나 문자가 오는 경우)
      { pattern: /\b\d{1,6}:\s*(?![0-9])/g, type: 'lineNumber', name: '123: (단어 경계)' },
      { pattern: /^\d{1,6}:\s*/gm, type: 'lineNumber', name: '123: (줄 시작)' },
      // JSON 내부에 있을 수 있는 라인 번호 패턴
      { pattern: /":\s*L\d{1,6}:/g, type: 'lineNumber', name: '":L123:' },
      { pattern: /":\s*\d{1,6}:/g, type: 'lineNumber', name: '":123:' },
      { pattern: /,\s*L\d{1,6}:/g, type: 'lineNumber', name: ',L123:' },
      { pattern: /,\s*\d{1,6}:/g, type: 'lineNumber', name: ',123:' },
      { pattern: /\{\s*L\d{1,6}:/g, type: 'lineNumber', name: '{L123:' },
      { pattern: /\[\s*L\d{1,6}:/g, type: 'lineNumber', name: '[L123:' },
      // 프롬프트 패턴
      { pattern: /More\?/gi, type: 'prompt', name: 'More?' },
      { pattern: /^>\s*/gm, type: 'prompt', name: '> 프롬프트' },
      { pattern: /^\$\s*/gm, type: 'prompt', name: '$ 프롬프트' },
      { pattern: /^C:\\Users\\.*>/gm, type: 'prompt', name: 'Windows 프롬프트' },
    ];
    
    const found = [];
    const lines = text.split(/\r?\n/);
    
    // 전체 텍스트에서도 검색 (줄 단위가 아닌)
    allPatterns.forEach(({ pattern, type, name }) => {
      const globalMatches = text.matchAll(pattern);
      for (const match of globalMatches) {
        // 라인 번호 계산
        const textBeforeMatch = text.substring(0, match.index);
        const lineNumber = textBeforeMatch.split(/\r?\n/).length;
        
        // 중복 제거
        const existing = found.find(f => 
          f.line === lineNumber && 
          Math.abs(f.position - match.index) < 10
        );
        
        if (!existing) {
          const line = lines[lineNumber - 1] || '';
          found.push({
            line: lineNumber,
            position: match.index,
            text: match[0],
            context: line.substring(Math.max(0, match.index - (textBeforeMatch.lastIndexOf('\n') >= 0 ? match.index - textBeforeMatch.lastIndexOf('\n') - 1 : 0) - 20), Math.min(line.length, (match.index - (textBeforeMatch.lastIndexOf('\n') >= 0 ? textBeforeMatch.lastIndexOf('\n') + 1 : 0)) + 50)),
            type: type,
            name: name
          });
        }
      }
    });
    
    // 정렬 (라인 번호 순)
    found.sort((a, b) => {
      if (a.line !== b.line) return a.line - b.line;
      return a.position - b.position;
    });
    
    return found;
  };

  // 3단계: JSON 정리 함수
  const cleanJson = () => {
    if (!rawJsonInput.trim()) {
      alert('정리할 JSON 텍스트를 입력해주세요.');
      return;
    }

    try {
      // 먼저 라인 번호 찾기
      const foundLineNumbers = findLineNumbers(rawJsonInput);
      setLineNumbers(foundLineNumbers);
      
      // 콘솔에 디버깅 정보 출력
      console.log('=== JSON 정리 디버깅 정보 ===');
      console.log('감지된 라인 번호 개수:', foundLineNumbers.length);
      console.log('감지된 라인 번호 목록:', foundLineNumbers);
      console.log('원본 텍스트 길이:', rawJsonInput.length);
      console.log('원본 텍스트 처음 500자:', rawJsonInput.substring(0, 500));
      
      // 라인 번호가 발견되면 자동으로 표시
      if (foundLineNumbers.length > 0) {
        setShowLineNumbers(true);
      }

      let cleaned = rawJsonInput;

      // 먼저 JSON 부분만 추출 (첫 번째 { 부터 마지막 } 까지)
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
        throw new Error('유효한 JSON 형식을 찾을 수 없습니다.');
      }

      // JSON 부분만 추출
      let jsonPart = cleaned.substring(firstBrace, lastBrace + 1);
      
      console.log('JSON 부분 추출 완료, 길이:', jsonPart.length);
      console.log('JSON 부분 처음 500자:', jsonPart.substring(0, 500));
      
      // 문자열 값 내부의 불필요한 줄바꿈을 이스케이프된 형태로 변환 (Windows cmd 응답에서 흔한 문제)
      // 더 안전한 방법: 문자 단위로 처리하여 이모지/멀티바이트 문자 보호
      function fixStringLineBreaks(text) {
        let result = '';
        let inString = false;
        let escapeNext = false;
        let i = 0;
        
        // 유효한 이스케이프 시퀀스 목록
        const validEscapes = ['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u'];
        
        while (i < text.length) {
          const char = text[i];
          
          // 이스케이프 문자 처리
          if (escapeNext) {
            // 이스케이프된 문자 처리
            if (char === 'n' || char === 'r' || char === 't') {
              // 이미 이스케이프된 \n, \r, \t는 그대로 유지
              result += char;
            } else if (char === 'u') {
              // 유니코드 이스케이프 시퀀스 (\uXXXX) 처리
              result += char;
              // 다음 4자리 16진수 읽기
              if (i + 4 < text.length) {
                const hexDigits = text.substring(i + 1, i + 5);
                if (/^[0-9A-Fa-f]{4}$/.test(hexDigits)) {
                  result += hexDigits;
                  i += 4;
                }
              }
            } else if (validEscapes.includes(char)) {
              // 유효한 이스케이프 시퀀스는 그대로 유지
              result += char;
            } else if (char === ' ') {
              // 백슬래시 다음에 공백이 오는 경우: 다음 문자 확인
              const nextChar = i + 1 < text.length ? text[i + 1] : null;
              if (nextChar === 'n') {
                // \ n -> \n
                result += 'n';
                i += 2; // 공백과 n 둘 다 건너뛰기
                escapeNext = false;
                continue;
              } else if (nextChar === 'r') {
                // \ r -> \r
                result += 'r';
                i += 2;
                escapeNext = false;
                continue;
              } else if (nextChar === 't') {
                // \ t -> \t
                result += 't';
                i += 2;
                escapeNext = false;
                continue;
              } else {
                // \  -> 공백 (백슬래시 제거)
                result += ' ';
                i++;
                escapeNext = false;
                continue;
              }
            } else if (char === '\n' || char === '\r' || char === '\t') {
              // 백슬래시 다음에 실제 줄바꿈/탭이 오는 경우는 이미 처리됨
              result += char;
            } else {
              // 잘못된 이스케이프 시퀀스: 백슬래시를 제거하고 문자만 추가
              // 예: \x -> x, \z -> z
              console.warn(`잘못된 이스케이프 시퀀스 발견: \\${char}, 백슬래시 제거`);
              result += char;
            }
            escapeNext = false;
            i++;
            continue;
          }
          
          if (char === '\\') {
            // 문자열 내부에서만 백슬래시 처리
            if (inString) {
              result += char;
              escapeNext = true;
              i++;
              continue;
            } else {
              // 문자열 외부의 백슬래시는 그대로 유지
              result += char;
              i++;
              continue;
            }
          }
          
          // 문자열 시작/끝 감지
          if (char === '"') {
            inString = !inString;
            result += char;
            i++;
            continue;
          }
          
          // 문자열 내부에서만 줄바꿈 처리
          if (inString) {
            // 실제 줄바꿈 문자를 이스케이프된 형태로 변환
            if (char === '\r') {
              // \r\n 조합 처리
              if (i + 1 < text.length && text[i + 1] === '\n') {
                result += '\\n';
                i += 2; // \r\n 둘 다 건너뛰기
                continue;
              } else {
                // 단독 \r도 \n으로 변환
                result += '\\n';
                i++;
                continue;
              }
            } else if (char === '\n') {
              // 실제 줄바꿈을 이스케이프된 형태로 변환
              result += '\\n';
              i++;
              continue;
            } else if (char === '\t') {
              // 탭도 이스케이프된 형태로 변환
              result += '\\t';
              i++;
              continue;
            }
            
            // 유효하지 않은 제어 문자 제거 (0x00-0x1F, 단 \n, \r, \t는 이미 처리됨)
            const charCode = char.charCodeAt(0);
            if (charCode < 32 && char !== '\n' && char !== '\r' && char !== '\t') {
              i++;
              continue;
            }
          }
          
          // 모든 다른 문자는 그대로 유지 (이모지, 멀티바이트 문자 포함)
          result += char;
          i++;
        }
        
        return result;
      }
      
      // 먼저 잘못된 이스케이프 시퀀스 수정 (fixStringLineBreaks 전에 처리)
      // 문자열 내부에서만 처리 (따옴표로 감싸진 부분)
      function fixBadEscapes(text) {
        let result = '';
        let inString = false;
        let escapeNext = false;
        let i = 0;
        
        while (i < text.length) {
          const char = text[i];
          const nextChar = i + 1 < text.length ? text[i + 1] : null;
          
          // 이스케이프 문자 처리
          if (escapeNext) {
            // 이미 이스케이프 상태에서 다음 문자 처리
            if (char === ' ' && nextChar === 'n') {
              // \ n -> \n
              result += '\\n';
              i += 2; // 공백과 n 둘 다 건너뛰기
              escapeNext = false;
              continue;
            } else if (char === ' ' && nextChar === 'r') {
              // \ r -> \r
              result += '\\r';
              i += 2;
              escapeNext = false;
              continue;
            } else if (char === ' ' && nextChar === 't') {
              // \ t -> \t
              result += '\\t';
              i += 2;
              escapeNext = false;
              continue;
            } else if (char === ' ') {
              // \  -> 공백 (백슬래시 제거)
              result += ' ';
              i++;
              escapeNext = false;
              continue;
            } else {
              // 유효한 이스케이프 시퀀스
              result += char;
              escapeNext = false;
              i++;
              continue;
            }
          }
          
          if (char === '\\') {
            if (inString) {
              result += char;
              escapeNext = true;
              i++;
              continue;
            } else {
              result += char;
              i++;
              continue;
            }
          }
          
          // 문자열 시작/끝 감지
          if (char === '"') {
            inString = !inString;
            result += char;
            i++;
            continue;
          }
          
          result += char;
          i++;
        }
        
        return result;
      }
      
      // 잘못된 이스케이프 시퀀스 먼저 수정
      jsonPart = fixBadEscapes(jsonPart);
      
      // 먼저 JSON 파싱 시도 (이미 정리된 경우)
      try {
        JSON.parse(jsonPart);
        console.log('✅ JSON이 이미 유효합니다.');
      } catch (e) {
        console.log('⚠️ JSON 파싱 실패, 줄바꿈 정리 수행:', e.message);
        // 파싱 실패 시 줄바꿈 정리 수행
        jsonPart = fixStringLineBreaks(jsonPart);
        
        // 추가 정리: \n 다음에 공백이 있고 그 다음에 n이 오는 패턴 수정
        // 예: \n n -> \nn 또는 \n\ n -> \nn
        jsonPart = jsonPart.replace(/\\n\s+n/g, '\\nn');
        jsonPart = jsonPart.replace(/\\n\\\s+n/g, '\\nn');
        jsonPart = jsonPart.replace(/\\r\s+r/g, '\\rr');
        jsonPart = jsonPart.replace(/\\r\\\s+r/g, '\\rr');
        jsonPart = jsonPart.replace(/\\t\s+t/g, '\\tt');
        jsonPart = jsonPart.replace(/\\t\\\s+t/g, '\\tt');
      }
      
      // 간단하고 효과적인 방법: 문자열 내부를 보호하면서 라인 번호 제거
      function removeLineNumbers(text) {
        let result = '';
        let inString = false;
        let escapeNext = false;
        let i = 0;
        
        while (i < text.length) {
          const char = text[i];
          const remaining = text.substring(i);
          
          // 이스케이프 문자 처리
          if (escapeNext) {
            result += char;
            escapeNext = false;
            i++;
            continue;
          }
          
          if (char === '\\') {
            result += char;
            escapeNext = true;
            i++;
            continue;
          }
          
          // 문자열 시작/끝 감지
          if (char === '"') {
            inString = !inString;
            result += char;
            i++;
            continue;
          }
          
          // 문자열 외부에서만 라인 번호 제거
          if (!inString) {
            // L123: 패턴 (공백 포함)
            const lineMatch = remaining.match(/^L\d{1,6}:\s*/);
            if (lineMatch) {
              i += lineMatch[0].length;
              continue;
            }
            
            // 숫자: 패턴 (123:)
            const numMatch = remaining.match(/^\d{1,6}:\s*/);
            if (numMatch) {
              i += numMatch[0].length;
              continue;
            }
          }
          
          result += char;
          i++;
        }
        
        return result;
      }
      
      // 라인 번호 제거 (여러 번 반복하여 확실하게)
      jsonPart = removeLineNumbers(jsonPart);
      jsonPart = removeLineNumbers(jsonPart); // 한 번 더
      
      // 줄 시작 부분의 불필요한 접두사 제거
      const lines = jsonPart.split(/\r?\n/);
      const cleanedLines = lines.map(line => {
        let cleanedLine = line;
        cleanedLine = cleanedLine.replace(/^>\s*/, '');
        cleanedLine = cleanedLine.replace(/^\$\s*/, '');
        cleanedLine = cleanedLine.replace(/^More\?\s*/, '');
        return cleanedLine;
      });
      
      jsonPart = cleanedLines.join('\n');
      
      // 앞뒤 공백 제거
      jsonPart = jsonPart.trim();
      
      // 추가 정리: 콜론 뒤에 오는 라인 번호 제거 (":L2:" -> ": ")
      jsonPart = jsonPart.replace(/":\s*L\d{1,6}:\s*/g, '": ');
      jsonPart = jsonPart.replace(/":\s*\d{1,6}:\s*/g, '": ');
      
      // 콤마 뒤에 오는 라인 번호 제거 (",L2:" -> ",")
      jsonPart = jsonPart.replace(/,\s*L\d{1,6}:\s*/g, ', ');
      jsonPart = jsonPart.replace(/,\s*\d{1,6}:\s*/g, ', ');
      
      // 중괄호 뒤에 오는 라인 번호 제거 ("{L2:" -> "{")
      jsonPart = jsonPart.replace(/\{\s*L\d{1,6}:\s*/g, '{');
      jsonPart = jsonPart.replace(/\{\s*\d{1,6}:\s*/g, '{');
      
      // 대괄호 뒤에 오는 라인 번호 제거 ("[L2:" -> "[")
      jsonPart = jsonPart.replace(/\[\s*L\d{1,6}:\s*/g, '[');
      jsonPart = jsonPart.replace(/\[\s*\d{1,6}:\s*/g, '[');
      
      // 문자열 값 내부의 라인 번호 제거 (신중하게)
      // 문자열 내부에서도 라인 번호가 있을 수 있지만, JSON 구조를 유지하면서 제거
      jsonPart = jsonPart.replace(/"([^"\\]|\\.)*"/g, (match) => {
        // 문자열 내부의 라인 번호 제거 (이스케이프된 따옴표는 보호)
        // 문자열 내용 부분만 처리 (따옴표 제외)
        const content = match.slice(1, -1);
        const cleanedContent = content.replace(/L\d{1,6}:/g, '').replace(/\d{1,6}:\s*(?![0-9])/g, '');
        return '"' + cleanedContent + '"';
      });
      
      // 연속된 콜론 제거
      jsonPart = jsonPart.replace(/::+/g, ':');
      
      // 연속된 공백 정리 (줄바꿈은 유지)
      jsonPart = jsonPart.replace(/[ \t]+/g, ' ');
      
      // 줄 시작의 라인 번호 제거 (한 번 더)
      jsonPart = jsonPart.split(/\r?\n/).map(line => {
        return line.replace(/^\s*L\d{1,6}:\s*/, '').replace(/^\s*\d{1,6}:\s*(?![0-9])/, '');
      }).join('\n');

      console.log('라인 번호 제거 후 JSON 길이:', jsonPart.length);
      console.log('라인 번호 제거 후 처음 500자:', jsonPart.substring(0, 500));
      
      // 모든 라인 번호 패턴을 한 번에 제거 (최종 정리)
      jsonPart = jsonPart.replace(/L\d{1,6}:\s*/g, '');
      jsonPart = jsonPart.replace(/(?<![0-9])\d{1,6}:\s*(?![0-9])/g, '');
      
      // 깨진 이모지(Replacement Character, U+FFFD) 제거 및 연속된 따옴표 수정
      function fixBrokenChars(text) {
        let result = '';
        let inString = false;
        let escapeNext = false;
        let i = 0;
        
        while (i < text.length) {
          const char = text[i];
          const charCode = char.charCodeAt(0);
          
          // 이스케이프 문자 처리
          if (escapeNext) {
            result += char;
            escapeNext = false;
            i++;
            continue;
          }
          
          if (char === '\\') {
            result += char;
            escapeNext = true;
            i++;
            continue;
          }
          
          // 문자열 시작/끝 감지
          if (char === '"') {
            if (inString) {
              // 문자열 종료
              inString = false;
              result += char;
              i++;
              
              // 문자열 종료 직후 연속된 따옴표 제거
              while (i < text.length && text[i] === '"') {
                i++;
              }
              continue;
            } else {
              // 문자열 시작
              inString = true;
              result += char;
              i++;
              continue;
            }
          }
          
          // 문자열 내부에서만 깨진 문자 처리
          if (inString) {
            // Replacement Character (U+FFFD, 65533) 제거
            if (charCode === 65533) {
              i++;
              continue;
            }
            
            // 실제 줄바꿈 문자를 이스케이프된 형태로 변환
            // escapeNext가 false이면 실제 줄바꿈 문자임
            if (char === '\r') {
              // \r\n 조합 처리
              if (i + 1 < text.length && text[i + 1] === '\n') {
                result += '\\n';
                i += 2; // \r\n 둘 다 건너뛰기
                continue;
              } else {
                // 단독 \r도 \n으로 변환
                result += '\\n';
                i++;
                continue;
              }
            } else if (char === '\n') {
              // 실제 줄바꿈을 이스케이프된 형태로 변환
              result += '\\n';
              i++;
              continue;
            } else if (char === '\t') {
              // 탭은 \t로 이스케이프
              result += '\\t';
              i++;
              continue;
            }
            
            // 유효하지 않은 제어 문자 제거
            if (charCode < 32) {
              i++;
              continue;
            }
          }
          
          result += char;
          i++;
        }
        
        return result;
      }
      
      // 깨진 문자와 연속된 따옴표 수정
      jsonPart = fixBrokenChars(jsonPart);
      
      console.log('최종 정리 후 JSON 길이:', jsonPart.length);
      console.log('최종 정리 후 처음 500자:', jsonPart.substring(0, 500));

      // JSON 파싱 시도
      let parsedJson;
      try {
        parsedJson = JSON.parse(jsonPart);
        console.log('✅ JSON 파싱 성공!');
      } catch (e) {
        console.error('❌ 첫 번째 파싱 실패:', e.message);
        const errorPos = e.message.match(/position (\d+)/)?.[1];
        if (errorPos) {
          const pos = parseInt(errorPos);
          console.log('파싱 실패 위치:', pos);
          console.log('파싱 실패 위치 주변 (앞 200자):', jsonPart.substring(Math.max(0, pos - 200), pos));
          console.log('파싱 실패 위치 주변 (뒤 200자):', jsonPart.substring(pos, Math.min(jsonPart.length, pos + 200)));
          console.log('원본 텍스트의 해당 위치:', rawJsonInput.substring(Math.max(0, pos - 200), Math.min(rawJsonInput.length, pos + 200)));
        } else {
          console.log('파싱 실패한 JSON 부분 (위치 13300-13400):', jsonPart.substring(13300, 13400));
        }
        
        // 파싱 실패 시 한 줄로 합쳐서 다시 시도
        // 먼저 문자열 내부의 줄바꿈을 정리
        let singleLine = fixStringLineBreaks(jsonPart);
        // 그 다음 전체를 한 줄로 합치기 (문자열 외부의 줄바꿈만 공백으로)
        singleLine = singleLine.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
        
        // 한 줄로 합친 후에도 라인 번호 제거
        const singleLineCleaned = removeLineNumbers(singleLine);
        let singleLineCleaned2 = singleLineCleaned
          .replace(/":\s*L\d{1,6}:\s*/g, '": ')
          .replace(/":\s*\d{1,6}:\s*/g, '": ')
          .replace(/,\s*L\d{1,6}:\s*/g, ', ')
          .replace(/,\s*\d{1,6}:\s*/g, ', ')
          .replace(/\{\s*L\d{1,6}:\s*/g, '{')
          .replace(/\{\s*\d{1,6}:\s*/g, '{')
          .replace(/\[\s*L\d{1,6}:\s*/g, '[')
          .replace(/\[\s*\d{1,6}:\s*/g, '[')
          .replace(/::+/g, ':');
        
        // 모든 라인 번호 패턴을 한 번에 제거
        singleLineCleaned2 = singleLineCleaned2.replace(/L\d{1,6}:\s*/g, '');
        singleLineCleaned2 = singleLineCleaned2.replace(/(?<![0-9])\d{1,6}:\s*(?![0-9])/g, '');
        
        // 문자열 내부의 라인 번호도 제거 (신중하게)
        singleLineCleaned2 = singleLineCleaned2.replace(/"([^"\\]|\\.)*"/g, (match) => {
          const content = match.slice(1, -1);
          const cleanedContent = content.replace(/L\d{1,6}:/g, '').replace(/\d{1,6}:\s*(?![0-9])/g, '');
          return '"' + cleanedContent + '"';
        });
        
        // 숫자 값 사이의 공백 제거 (문자열 외부에서만)
        // 예: 1.124883787 8787878 -> 1.1248837878787878 (잘못된 경우)
        // 또는 1.124883787,8787878 -> 1.124883787,8787878 (올바른 경우)
        // 패턴: 숫자 다음에 공백이 있고 그 다음에 숫자가 오는 경우 (콤마나 다른 구분자가 없는 경우)
        singleLineCleaned2 = singleLineCleaned2.replace(/(\d+\.?\d*)\s+(\d+\.?\d*)(?![,}\]:])/g, (match, num1, num2, offset, str) => {
          // 문자열 내부인지 확인
          let inString = false;
          let escapeNext = false;
          for (let i = 0; i < offset; i++) {
            if (escapeNext) {
              escapeNext = false;
              continue;
            }
            if (str[i] === '\\') {
              escapeNext = true;
              continue;
            }
            if (str[i] === '"') {
              inString = !inString;
            }
          }
          // 문자열 내부가 아니고, 콤마나 다른 구분자가 없는 경우에만 공백 제거
          if (!inString) {
            // 숫자 값 사이의 공백을 제거 (잘못된 JSON 구조 수정)
            return num1 + num2;
          }
          return match;
        });
        
        console.log('한 줄로 합친 후 길이:', singleLineCleaned2.length);
        console.log('한 줄로 합친 후 (위치 13300-13400):', singleLineCleaned2.substring(13300, 13400));
        
        try {
          parsedJson = JSON.parse(singleLineCleaned2);
          console.log('✅ 한 줄로 합친 후 파싱 성공!');
        } catch (e2) {
          console.error('❌ 두 번째 파싱 실패:', e2.message);
          const errorPos = e2.message.match(/position (\d+)/)?.[1];
          if (errorPos) {
            const pos = parseInt(errorPos);
            console.log('파싱 실패 위치:', pos);
            console.log('파싱 실패 위치 주변 (앞 200자):', singleLineCleaned2.substring(Math.max(0, pos - 200), pos));
            console.log('파싱 실패 위치 주변 (뒤 200자):', singleLineCleaned2.substring(pos, Math.min(singleLineCleaned2.length, pos + 200)));
            console.log('문제가 되는 문자들:', singleLineCleaned2.substring(Math.max(0, pos - 10), Math.min(singleLineCleaned2.length, pos + 10)).split('').map(c => c.charCodeAt(0)));
          }
          
          // 최종 시도: 더 공격적인 정리
          let finalAttempt = singleLineCleaned2;
          
          // 잘못된 이스케이프 시퀀스 수정: \n 다음에 공백이 있고 그 다음에 n이 오는 패턴
          // 예: \n n -> \nn 또는 \n n -> \n n (공백 제거)
          finalAttempt = finalAttempt.replace(/\\n\s+n/g, '\\nn');
          finalAttempt = finalAttempt.replace(/\\r\s+r/g, '\\rr');
          finalAttempt = finalAttempt.replace(/\\t\s+t/g, '\\tt');
          
          // 백슬래시 다음에 공백이 오는 패턴 수정: \ n -> n (백슬래시 제거)
          finalAttempt = finalAttempt.replace(/\\\s+n/g, 'n');
          finalAttempt = finalAttempt.replace(/\\\s+r/g, 'r');
          finalAttempt = finalAttempt.replace(/\\\s+t/g, 't');
          
          // 잘못된 이스케이프 시퀀스 수정: 백슬래시 다음에 유효하지 않은 문자가 오는 경우
          // 문자열 내부에서만 처리 (따옴표로 감싸진 부분)
          finalAttempt = finalAttempt.replace(/"([^"\\]|\\.)*"/g, (match) => {
            // 문자열 내용만 처리
            const content = match.slice(1, -1);
            let cleaned = '';
            let i = 0;
            while (i < content.length) {
              if (content[i] === '\\') {
                if (i + 1 < content.length) {
                  const nextChar = content[i + 1];
                  // 유효한 이스케이프 시퀀스인지 확인
                  if (['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u'].includes(nextChar)) {
                    cleaned += content[i] + nextChar;
                    i += 2;
                    // \u 다음에 4자리 16진수가 오는지 확인
                    if (nextChar === 'u' && i + 4 <= content.length) {
                      const hexDigits = content.substring(i, i + 4);
                      if (/^[0-9A-Fa-f]{4}$/.test(hexDigits)) {
                        cleaned += hexDigits;
                        i += 4;
                      }
                    }
                  } else if (nextChar === ' ' || nextChar === '\n' || nextChar === '\r' || nextChar === '\t') {
                    // 백슬래시 다음에 공백이나 줄바꿈이 오는 경우: 백슬래시 제거
                    if (nextChar === '\n') {
                      cleaned += 'n';
                    } else if (nextChar === '\r') {
                      cleaned += 'r';
                    } else if (nextChar === '\t') {
                      cleaned += 't';
                    } else {
                      cleaned += nextChar;
                    }
                    i += 2;
                  } else {
                    // 잘못된 이스케이프 시퀀스: 백슬래시 제거하고 문자만 추가
                    cleaned += nextChar;
                    i += 2;
                  }
                } else {
                  // 백슬래시가 마지막 문자인 경우: 제거
                  i++;
                }
              } else {
                cleaned += content[i];
                i++;
              }
            }
            return '"' + cleaned + '"';
          });
          
          // 잘못된 이스케이프 시퀀스 수정
          finalAttempt = finalAttempt.replace(/\\"/g, '\\"'); // 이스케이프된 따옴표 보호
          
          // 연속된 따옴표 제거 ("" -> ")
          finalAttempt = finalAttempt.replace(/""+/g, '"');
          
          // 숫자 값 사이의 공백 제거 (문자열 외부에서만)
          finalAttempt = finalAttempt.replace(/(\d+\.?\d*)\s+(\d+\.?\d*)(?![,}\]:])/g, (match, num1, num2, offset, str) => {
            // 문자열 내부인지 확인
            let inString = false;
            let escapeNext = false;
            for (let i = 0; i < offset; i++) {
              if (escapeNext) {
                escapeNext = false;
                continue;
              }
              if (str[i] === '\\') {
                escapeNext = true;
                continue;
              }
              if (str[i] === '"') {
                inString = !inString;
              }
            }
            // 문자열 내부가 아니고, 콤마나 다른 구분자가 없는 경우에만 공백 제거
            if (!inString) {
              // 숫자 값 사이의 공백을 제거 (잘못된 JSON 구조 수정)
              return num1 + num2;
            }
            return match;
          });
          
          // 문자열 외부의 불필요한 공백 제거
          finalAttempt = finalAttempt.replace(/\s*([{}[\],:])\s*/g, '$1');
          
          // 최종 시도: JSON 부분만 추출
          const jsonMatch = finalAttempt.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              parsedJson = JSON.parse(jsonMatch[0]);
              console.log('✅ 최종 정리 후 파싱 성공!');
            } catch (e3) {
              console.error('❌ 최종 파싱 실패:', e3.message);
              const finalErrorPos = e3.message.match(/position (\d+)/)?.[1];
              if (finalErrorPos) {
                const finalPos = parseInt(finalErrorPos);
                console.log('최종 실패 위치:', finalPos);
                console.log('최종 실패 위치 주변:', jsonMatch[0].substring(Math.max(0, finalPos - 50), Math.min(jsonMatch[0].length, finalPos + 50)));
              }
              throw new Error('유효한 JSON 형식을 찾을 수 없습니다. 원본을 확인해주세요: ' + e3.message);
            }
          } else {
            throw new Error('유효한 JSON 형식을 찾을 수 없습니다: ' + e2.message);
          }
        }
      }

      // 정리된 JSON을 예쁘게 포맷팅
      const formattedJson = JSON.stringify(parsedJson, null, 2);
      setCleanedJson(formattedJson);
    } catch (error) {
      alert('JSON 정리 중 오류가 발생했습니다: ' + error.message);
      console.error('원본 텍스트:', rawJsonInput);
      console.error('오류:', error);
    }
  };

  return (
    <div className="posting-check-guide">
      <div className="guide-container">
        <div className="guide-header">
          <Link to="/posting" className="back-btn">← 뒤로</Link>
          <h2>포스팅 체크 가이드</h2>
        </div>

        {/* 단계 탭 */}
        <div className="steps-tabs">
          <button
            className={`step-tab ${activeStep === 1 ? 'active' : ''}`}
            onClick={() => setActiveStep(1)}
            title="1단계"
          >
            <span className="step-number">1</span>
          </button>
          <button
            className={`step-tab ${activeStep === 2 ? 'active' : ''}`}
            onClick={() => setActiveStep(2)}
            title="2단계"
          >
            <span className="step-number">2</span>
          </button>
          <button
            className={`step-tab ${activeStep === 3 ? 'active' : ''}`}
            onClick={() => setActiveStep(3)}
            title="3단계"
          >
            <span className="step-number">3</span>
          </button>
        </div>

        {/* 단계 내용 */}
        <div className="steps-content">
          {activeStep === 1 && (
            <div className="step-card">
              <div className="step-content">
                <h3>1단계: curl 명령어 준비</h3>
                
                <div className="step1-content">
                  <div className="step1-text">
                    <h4>준비방법</h4>
                    <p className="step1-notice">KYC는 필수적으로 필요합니다.</p>
                    <ol className="step1-steps">
                      <li>카이토 홈페이지에 접속한 후 런치패들을 클릭해주세요</li>
                      <li>아무런 프로젝트를 클릭해주세요</li>
                      <li>개발자도구를 열어 network탭에서 검색창의 public을 입력한 후 나오는 요소에 우클릭을 하여 copy as curl(cmd)를 눌러주면 끝!</li>
                    </ol>
                  </div>

                  <div className="step1-images">
                    <div className="image-slider">
                      <button 
                        className="slider-btn prev-btn"
                        onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? 2 : prev - 1))}
                        disabled={currentImageIndex === 0}
                      >
                        <FaChevronLeft />
                      </button>
                      <div className="image-container">
                        <img 
                          src={`/images/guide/step1/image${currentImageIndex + 1}.png`}
                          alt={`Step 1 - ${currentImageIndex + 1}`}
                          className="guide-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="image-placeholder" style={{ display: 'none' }}>
                          <p>이미지 {currentImageIndex + 1}을(를) 추가해주세요</p>
                          <p className="image-path">/images/guide/step1/image{currentImageIndex + 1}.png</p>
                        </div>
                      </div>
                      <button 
                        className="slider-btn next-btn"
                        onClick={() => setCurrentImageIndex((prev) => (prev === 2 ? 0 : prev + 1))}
                        disabled={currentImageIndex === 2}
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                    <div className="image-indicator">
                      {[0, 1, 2].map((index) => (
                        <span
                          key={index}
                          className={`indicator-dot ${currentImageIndex === index ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="step-card">
              <div className="step-content">
                <h3>2단계: curl 명령어 수정</h3>
                <p>curl 명령어 템플릿을 입력하고 필요한 값들을 수정하세요.</p>
                <div style={{ 
                  marginBottom: '1rem', 
                  padding: '1rem', 
                  backgroundColor: '#e7f3ff', 
                  border: '1px solid #b3d9ff', 
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  color: '#004085'
                }}>
                  <p style={{ margin: 0 }}>
                    💡 업데이트된 명령어를 윈도우 cmd에 입력 후 반환하는 값을 복사하여 다음 단계로 넘어가세요.
                  </p>
                </div>
                
                <div className="step2-layout">
                  {/* 왼쪽: 입력 */}
                  <div className="step2-container step2-left">
                    <div className="container-header">
                      <h4>명령어 템플릿</h4>
                    </div>
                    <div className="container-body">
                      <div className="form-section">
                        <div className="form-group">
                          <label>
                            curl 명령어 템플릿
                            <span className="required">*</span>
                          </label>
                          <textarea
                            className="curl-template-input"
                            value={curlTemplate}
                            onChange={handleCurlTemplateChange}
                            placeholder="curl 명령어를 여기에 붙여넣으세요..."
                          />
                        </div>

                        <div className="posting-check-form">
                          <div className="form-row">
                            <div className="form-group">
                              <label>
                                Crypto Ticker
                              </label>
                              <input
                                type="text"
                                name="ticker"
                                value={formData.ticker}
                                onChange={handleInputChange}
                                placeholder="예: TRIA"
                              />
                            </div>

                            <div className="form-group">
                              <label>
                                Language
                              </label>
                              <select
                                name="language"
                                value={formData.language}
                                onChange={handleInputChange}
                              >
                                <option value="ko">ko</option>
                                <option value="en">en</option>
                                <option value="ko,en">ko,en</option>
                              </select>
                            </div>

                            <div className="form-group">
                              <label>
                                Size
                              </label>
                              <input
                                type="number"
                                name="size"
                                value={formData.size}
                                onChange={handleInputChange}
                                min="1"
                                max="100"
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>
                              Twitter User ID
                            </label>
                            <input
                              type="text"
                              name="userId"
                              value={formData.userId}
                              onChange={handleInputChange}
                              placeholder="예: 1234567890,9876543210"
                            />
                          </div>

                          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                              className="submit-btn"
                              onClick={updateCurlCommand}
                            >
                              명령어 업데이트
                            </button>
                            <button
                              className="submit-btn"
                              onClick={resetCurlTemplate}
                              style={{ backgroundColor: '#999' }}
                            >
                              초기화
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 오른쪽: 결과 */}
                  <div className="step2-container step2-right">
                    <div className="container-header">
                      <h4>업데이트된 명령어</h4>
                    </div>
                    <div className="container-body">
                      {updatedCurlCommand ? (
                        <div className="curl-container">
                          <div className="curl-header">
                            <span>명령어</span>
                            <button
                              className="copy-btn"
                              onClick={() => copyToClipboard(updatedCurlCommand)}
                            >
                              복사
                            </button>
                          </div>
                          <div className="curl-content">
                            <pre>{updatedCurlCommand}</pre>
                          </div>
                        </div>
                      ) : (
                        <div className="curl-placeholder">
                          <p>명령어 업데이트 버튼을 클릭하면<br />변경된 명령어가 여기에 표시됩니다.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="step-card">
              <div className="step-content">
                <h3>3단계: JSON 정리</h3>
                <div style={{ 
                  marginBottom: '1rem', 
                  padding: '1rem', 
                  backgroundColor: '#e7f3ff', 
                  border: '1px solid #b3d9ff', 
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  lineHeight: '1.6'
                }}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#004085', marginBottom: '0.5rem' }}>
                    📋 사용 방법
                  </p>
                  <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#004085' }}>
                    <li style={{ marginBottom: '0.25rem' }}>cmd에서 반환한 JSON 응답을 정리하세요.</li>
                    <li style={{ marginBottom: '0.25rem' }}>정리된 JSON 파일을 복사하여 포스팅체크에서 분석하세요.</li>
                  </ol>
                </div>
                
                <div className="form-section">
                  <div className="form-group">
                    <label>
                      원본 JSON 텍스트
                      <span className="required">*</span>
                    </label>
                    <textarea
                      className="curl-template-input"
                      value={rawJsonInput}
                      onChange={(e) => {
                        setRawJsonInput(e.target.value);
                        // 입력 시 라인 번호 초기화
                        setLineNumbers([]);
                        setShowLineNumbers(false);
                      }}
                      placeholder="cmd에서 복사한 JSON 텍스트를 여기에 붙여넣으세요..."
                      style={{ minHeight: '300px' }}
                    />
                  </div>

                  {/* 버튼 그룹 */}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                      className="submit-btn"
                      onClick={cleanJson}
                      style={{ backgroundColor: '#28a745' }}
                    >
                      정리하기
                    </button>
                    
                    <button
                      className="submit-btn"
                      onClick={resetJsonInput}
                      style={{ backgroundColor: '#999' }}
                    >
                      초기화
                    </button>
                  </div>

                  {/* 라인 번호 표시 패널 */}
                  {lineNumbers.length > 0 && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      backgroundColor: '#fff3cd',
                      border: '1px solid #ffc107',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <strong style={{ color: '#856404' }}>
                          ⚠️ 발견된 라인 번호: {lineNumbers.length}개
                        </strong>
                        <button
                          onClick={() => setShowLineNumbers(!showLineNumbers)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#856404',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          {showLineNumbers ? '▼ 숨기기' : '▶ 보기'}
                        </button>
                      </div>
                      {/* 라인 번호 목록 */}
                      {showLineNumbers && (
                        <div style={{
                          maxHeight: '250px',
                          overflowY: 'auto',
                          fontSize: '0.85rem',
                          fontFamily: 'monospace',
                          backgroundColor: '#fff',
                          padding: '0.5rem',
                          borderRadius: '4px'
                        }}>
                          <div style={{ 
                            marginBottom: '0.5rem', 
                            padding: '0.5rem',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            color: '#666'
                          }}>
                            다음 라인 번호들이 감지되었습니다. JSON 정리 시 자동으로 제거됩니다.
                          </div>
                          {lineNumbers.map((item, index) => (
                            <div key={index} style={{
                              padding: '0.5rem',
                              marginBottom: '0.5rem',
                              backgroundColor: '#fff',
                              borderRadius: '4px',
                              border: '1px solid #ffc107',
                              borderLeft: '4px solid #ffc107'
                            }}>
                              <div style={{ color: '#856404', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                <span style={{ color: '#d9534f', fontFamily: 'monospace' }}>{item.text}</span>
                                <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                                  (줄 {item.line}, 위치 {item.position})
                                </span>
                              </div>
                              <div style={{ 
                                color: '#666', 
                                fontSize: '0.75rem',
                                fontFamily: 'monospace',
                                backgroundColor: '#f8f9fa',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '2px',
                                wordBreak: 'break-all'
                              }}>
                                {item.context}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {cleanedJson && (
                    <div style={{ marginTop: '2rem' }}>
                      <div style={{ 
                        marginBottom: '1rem', 
                        padding: '0.75rem', 
                        backgroundColor: '#d4edda', 
                        border: '1px solid #c3e6cb', 
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        color: '#155724'
                      }}>
                        ✅ 정리 완료! 아래 정리된 JSON을 복사하여 포스팅체크 페이지에서 분석하세요.
                      </div>
                      <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <label>
                            정리된 JSON
                          </label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="copy-btn"
                              onClick={() => copyToClipboard(cleanedJson)}
                            >
                              복사
                            </button>
                            <button
                              className="copy-btn"
                              onClick={downloadJson}
                              style={{ backgroundColor: '#28a745' }}
                            >
                              다운로드
                            </button>
                          </div>
                        </div>
                        <textarea
                          className="curl-template-input"
                          value={cleanedJson}
                          readOnly
                          style={{ minHeight: '400px', backgroundColor: '#f8f9fa' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostingCheckGuide;

