import React, { useState } from 'react';
import styled from 'styled-components';
import { authAPI } from '../services/api';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #85a65c;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 400px;

  @media (max-width: 768px) {
    padding: 2rem;
    border-radius: 16px;
    max-width: 100%;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const Logo = styled.img`
  height: 60px;
  width: auto;
  object-fit: contain;

  @media (max-width: 768px) {
    height: 50px;
  }
`;

const Title = styled.h1`
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #64748b;
  text-align: center;
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    margin-bottom: 1.25rem;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #85a65c;
  }

  &::placeholder {
    color: #9ca3af;
  }

  &.error {
    border-color: #ef4444;
  }

  @media (max-width: 768px) {
    padding: 0.875rem;
    font-size: 16px; /* iOS 줌 방지 */
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #85a65c;
  color: white;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: none;
  cursor: pointer;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(133, 166, 92, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 1.125rem;
    font-size: 1rem;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
`;

const FieldErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  margin-left: 0.25rem;
`;

const SignupMessage = styled.div`
  margin-top: 1rem;
  text-align: center;
`;


const SignupLink = styled.a`
  color: #85a65c;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: #6b8a4a;
    text-decoration: underline;
  }
`;

const LoginPage = ({ onLogin }) => {
  const [businessNumber, setBusinessNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name, value) => {
    let errorMessage = '';

    switch (name) {
      case 'businessNumber':
        if (!value.trim()) {
          errorMessage = '사업자번호를 입력해주세요.';
        }
        break;
      case 'password':
        if (!value.trim()) {
          errorMessage = '비밀번호를 입력해주세요.';
        }
        break;
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
  };

  const handleInputChange = (name, value) => {
    if (name === 'businessNumber') {
      setBusinessNumber(value);
    } else if (name === 'password') {
      setPassword(value);
    }
    
    // 실시간 검증
    validateField(name, value);
    
    // 전체 에러 메시지 초기화
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 빈 값 검증
    if (!businessNumber.trim() && !password.trim()) {
      setError('사업자번호와 비밀번호를 모두 입력해주세요.');
      setIsLoading(false);
      return;
    }
    
    if (!businessNumber.trim()) {
      setError('사업자번호를 입력해주세요.');
      setIsLoading(false);
      return;
    }
    
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      // 실제 Lambda API 호출
      const response = await authAPI.login(businessNumber, password);
      
      if (response.ok) {
        onLogin({
          businessNumber,
          businessName: response.user.orgName,
          businessOwner: response.user.orgName
        });
      } else {
        setError(response.message || '사업자번호 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LogoContainer>
          <Logo 
            src="https://www.beautifulstore.org/wp-content/uploads/2025/06/%EC%95%84%EB%A6%84%EB%8B%A4%EC%9A%B4%EA%B0%80%EA%B2%8C_CI.png" 
            alt="아름다운가게 로고"
          />
        </LogoContainer>
        <Title>나눔보따리<br />지원대상자 등록/엑셀받기</Title>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="businessNumber">사업자번호</Label>
            <Input
              id="businessNumber"
              type="text"
              placeholder="사업자번호를 입력하세요"
              value={businessNumber}
              onChange={(e) => handleInputChange('businessNumber', e.target.value)}
              className={fieldErrors.businessNumber ? 'error' : ''}
            />
            {fieldErrors.businessNumber && <FieldErrorMessage>{fieldErrors.businessNumber}</FieldErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={fieldErrors.password ? 'error' : ''}
            />
            {fieldErrors.password && <FieldErrorMessage>{fieldErrors.password}</FieldErrorMessage>}
          </FormGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </LoginButton>

          <SignupMessage>
            <SignupLink href="https://nanum.beautifulstore.org" target="_blank" rel="noopener noreferrer">
              나눔사업 사이트 바로가기 →
            </SignupLink>
          </SignupMessage>
        </form>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
