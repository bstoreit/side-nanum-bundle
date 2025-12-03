import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;

  @media (max-width: 768px) {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    padding: 1.5rem;
    border-radius: 12px;
    max-height: 85vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const CloseButton = styled.button`
  padding: 0.5rem;
  background-color: #f3f4f6;
  color: #6b7280;
  border-radius: 8px;
  font-size: 1.2rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #e5e7eb;
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 1.4rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.875rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #85a65c;
  }

  &.error {
    border-color: #ef4444;
  }

  @media (max-width: 768px) {
    font-size: 16px; /* iOS 줌 방지 */
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #85a65c;
  }

  &.error {
    border-color: #ef4444;
  }

  @media (max-width: 768px) {
    font-size: 16px; /* iOS 줌 방지 */
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #85a65c;
  }

  &.error {
    border-color: #ef4444;
  }

  @media (max-width: 768px) {
    font-size: 16px; /* iOS 줌 방지 */
    min-height: 100px;
  }
`;

const PhoneInputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
`;

const PhoneSelect = styled.select`
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  width: 80px;
  min-width: 80px;
  max-width: 80px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #85a65c;
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    font-size: 16px; /* iOS 줌 방지 */
  }
`;

const PhoneInput = styled.input`
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  max-width: 100px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #85a65c;
  }

  &.error {
    border-color: #ef4444;
  }

  @media (max-width: 768px) {
    max-width: 100%;
    font-size: 16px; /* iOS 줌 방지 */
  }
`;

const AddressGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
`;

const AddressInput = styled.input`
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #85a65c;
  }

  &.error {
    border-color: #ef4444;
  }

  &.zipcode {
    width: 120px;
  }

  &.address {
    flex: 1;
  }

  @media (max-width: 768px) {
    font-size: 16px; /* iOS 줌 방지 */
    
    &.zipcode {
      width: 100%;
    }
  }
`;

const AddressButton = styled.button`
  padding: 0.75rem 1rem;
  background-color: #85a65c;
  color: white;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #5a67d8;
  }

  @media (max-width: 768px) {
    width: 100%;
    font-size: 0.85rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.25rem;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &.save {
    background: #85a65c;
    color: white;

    &:hover {
      transform: translateY(-1px);
    }
  }

  &.cancel {
    background-color: #f3f4f6;
    color: #6b7280;

    &:hover {
      background-color: #e5e7eb;
    }
  }

  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 0.9rem;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  margin-left: 0.25rem;
`;

const RequiredStar = styled.span`
  color: #ef4444;
  margin-left: 0.25rem;
`;

const TargetModal = ({ target, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    targetType: '',
    targetHousehold: '',
    zipcode: '',
    address: '',
    detailAddress: '',
    mobilePhoneArea: '010',
    mobilePhoneMiddle: '',
    mobilePhoneLast: '',
    phoneArea: '02',
    phoneMiddle: '',
    phoneLast: '',
    applicationReason: '',
    directions: ''
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let errorMessage = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          errorMessage = '대상자명은 필수 입력 항목입니다.';
        }
        break;
      case 'targetType':
        if (!value.trim()) {
          errorMessage = '대상구분은 필수 입력 항목입니다.';
        }
        break;
      case 'targetHousehold':
        if (!value.trim()) {
          errorMessage = '대상가구는 필수 입력 항목입니다.';
        }
        break;
      case 'zipcode':
      case 'address':
        if (!value.trim()) {
          errorMessage = '주소는 필수 입력 항목입니다.';
        }
        break;
      case 'mobilePhoneMiddle':
        if (!value.trim()) {
          errorMessage = '핸드폰 번호를 입력해주세요.';
        } else if (value.trim().length !== 4) {
          errorMessage = '핸드폰 중간번호는 4자리여야 합니다.';
        }
        break;
      case 'mobilePhoneLast':
        if (!value.trim()) {
          errorMessage = '핸드폰 번호를 입력해주세요.';
        } else if (value.trim().length !== 4) {
          errorMessage = '핸드폰 끝번호는 4자리여야 합니다.';
        }
        break;
      case 'phoneMiddle':
        if (value.trim()) {
          if (value.trim().length < 3 || value.trim().length > 4) {
            errorMessage = '일반전화 중간번호는 3~4자리여야 합니다.';
          }
        }
        break;
      case 'phoneLast':
        if (value.trim()) {
          if (value.trim().length !== 4) {
            errorMessage = '일반전화 끝번호는 4자리여야 합니다.';
          }
        }
        break;
      case 'applicationReason':
        if (!value.trim()) {
          errorMessage = '신청사유는 필수 입력 항목입니다.';
        }
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
  };

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // 숫자만 추출
    const numbers = phone.replace(/\D/g, '');
    
    // 핸드폰 번호 (010, 011, 016, 017, 018, 019)
    if (numbers.length === 11 && numbers.startsWith('010')) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    }
    if (numbers.length === 11 && (numbers.startsWith('011') || numbers.startsWith('016') || 
                                 numbers.startsWith('017') || numbers.startsWith('018') || numbers.startsWith('019'))) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    }
    
    // 일반 전화번호 (지역번호 2자리)
    if (numbers.length === 9 && (numbers.startsWith('02') || numbers.startsWith('03') || 
                                 numbers.startsWith('04') || numbers.startsWith('05') || numbers.startsWith('06'))) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
    }
    
    // 일반 전화번호 (지역번호 3자리)
    if (numbers.length === 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    }
    
    // 기본 포맷 (3-4-4)
    if (numbers.length >= 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
    
    return phone; // 포맷팅할 수 없는 경우 원본 반환
  };

  // 전화번호를 분리된 필드로 파싱하는 함수
  const parsePhoneNumber = (phone) => {
    if (!phone) return { area: '', middle: '', last: '' };
    
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length === 11 && numbers.startsWith('01')) {
      return {
        area: numbers.slice(0, 3),
        middle: numbers.slice(3, 7),
        last: numbers.slice(7)
      };
    } else if (numbers.startsWith('02')) {
      // 서울 지역번호 (02) - 9자리 또는 10자리
      if (numbers.length === 9) {
        return {
          area: numbers.slice(0, 2),
          middle: numbers.slice(2, 5),
          last: numbers.slice(5)
        };
      } else if (numbers.length === 10) {
        return {
          area: numbers.slice(0, 2),
          middle: numbers.slice(2, 6),
          last: numbers.slice(6)
        };
      }
    } else if (numbers.length === 10 && (numbers.startsWith('031') || numbers.startsWith('032') || numbers.startsWith('033') ||
                                        numbers.startsWith('041') || numbers.startsWith('042') || numbers.startsWith('043') ||
                                        numbers.startsWith('051') || numbers.startsWith('052') || numbers.startsWith('053') ||
                                        numbers.startsWith('061') || numbers.startsWith('062') || numbers.startsWith('063'))) {
      return {
        area: numbers.slice(0, 3),
        middle: numbers.slice(3, 6),
        last: numbers.slice(6)
      };
    }
    
    return { area: '', middle: '', last: '' };
  };

  useEffect(() => {
    if (target) {
      // 기존 주소를 분리 (예: "12345 서울시 강남구 테헤란로 123")
      const addressParts = target.address ? target.address.split(' ') : ['', '', ''];
      const mobilePhone = parsePhoneNumber(target.mobilePhone || '');
      const officePhone = parsePhoneNumber(target.phone || '');
      
      setFormData({
        name: target.name || '',
        targetType: target.targetType || '',
        targetHousehold: target.targetHousehold || '',
        zipcode: addressParts[0] || '',
        address: addressParts.slice(1).join(' ') || '',
        detailAddress: target.detailAddress || '',
        mobilePhoneArea: mobilePhone.area || '010',
        mobilePhoneMiddle: mobilePhone.middle || '',
        mobilePhoneLast: mobilePhone.last || '',
        phoneArea: officePhone.area || '02',
        phoneMiddle: officePhone.middle || '',
        phoneLast: officePhone.last || '',
        applicationReason: target.applicationReason || '',
        directions: target.directions || ''
      });
    } else {
      setFormData({
        name: '',
        targetType: '',
        targetHousehold: '',
        zipcode: '',
        address: '',
        detailAddress: '',
        mobilePhoneArea: '010',
        mobilePhoneMiddle: '',
        mobilePhoneLast: '',
        phoneArea: '02',
        phoneMiddle: '',
        phoneLast: '',
        applicationReason: '',
        directions: ''
      });
    }
  }, [target]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 핸드폰 가운데 번호 4자리 입력 시 자동으로 다음 칸으로 이동
    if (name === 'mobilePhoneMiddle' && value.length === 4) {
      const nextInput = document.querySelector('input[name="mobilePhoneLast"]');
      if (nextInput) {
        nextInput.focus();
      }
    }
    
    // 일반전화 가운데 번호 4자리 입력 시 자동으로 다음 칸으로 이동
    if (name === 'phoneMiddle' && value.length === 4) {
      const nextInput = document.querySelector('input[name="phoneLast"]');
      if (nextInput) {
        nextInput.focus();
      }
    }

    // 실시간 검증
    validateField(name, value);
  };

  const handleAddressSearch = () => {
    // 다음 주소검색 API 스크립트 로드
    if (!window.daum) {
      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.onload = () => {
        openAddressSearch();
      };
      document.head.appendChild(script);
    } else {
      openAddressSearch();
    }
  };

  const openAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        // 우편번호와 주소 정보를 해당 필드에 넣는다.
        setFormData(prev => ({
          ...prev,
          zipcode: data.zonecode,
          address: data.address
        }));
      }
    }).open();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 필수 입력 항목 검증
    if (!formData.name.trim()) {
      alert('대상자명은 필수 입력 항목입니다.');
      return;
    }
    
    if (!formData.targetType.trim()) {
      alert('대상구분은 필수 입력 항목입니다.');
      return;
    }
    
    if (!formData.targetHousehold.trim()) {
      alert('대상가구는 필수 입력 항목입니다.');
      return;
    }
    
    if (!formData.zipcode.trim() || !formData.address.trim()) {
      alert('주소는 필수 입력 항목입니다.');
      return;
    }
    
    if (!formData.mobilePhoneMiddle.trim() || !formData.mobilePhoneLast.trim()) {
      alert('핸드폰은 필수 입력 항목입니다.');
      return;
    }
    
    // 핸드폰 자릿수 검증
    if (formData.mobilePhoneMiddle.trim().length !== 4) {
      alert('핸드폰 중간번호는 4자리여야 합니다.');
      return;
    }
    if (formData.mobilePhoneLast.trim().length !== 4) {
      alert('핸드폰 끝번호는 4자리여야 합니다.');
      return;
    }
    
    // 일반전화 검증 - 하나라도 입력되면 모든 필드 필수
    const hasPhoneMiddle = formData.phoneMiddle && formData.phoneMiddle.trim();
    const hasPhoneLast = formData.phoneLast && formData.phoneLast.trim();
    
    if (hasPhoneMiddle || hasPhoneLast) {
      // 하나라도 입력되면 모든 필드 필수
      if (!formData.phoneMiddle.trim()) {
        alert('일반전화 번호를 모두 입력해주세요.');
        return;
      }
      if (!formData.phoneLast.trim()) {
        alert('일반전화 번호를 모두 입력해주세요.');
        return;
      }
    }
    
    // 일반전화 자릿수 검증 (입력된 값이 있을 때만)
    if (formData.phoneMiddle.trim() && (formData.phoneMiddle.trim().length < 3 || formData.phoneMiddle.trim().length > 4)) {
      alert('일반전화 중간번호는 3~4자리여야 합니다.');
      return;
    }
    if (formData.phoneLast.trim() && formData.phoneLast.trim().length !== 4) {
      alert('일반전화 끝번호는 4자리여야 합니다.');
      return;
    }
    
    if (!formData.applicationReason.trim()) {
      alert('신청사유는 필수 입력 항목입니다.');
      return;
    }

    // 주소 정보를 합쳐서 저장
    const fullAddress = `${formData.zipcode} ${formData.address}`.trim();
    // 일반전화가 비어있는지 확인
    const phoneMiddle = formData.phoneMiddle.trim();
    const phoneLast = formData.phoneLast.trim();
    const phone = (phoneMiddle && phoneLast) ? `${formData.phoneArea}${phoneMiddle}${phoneLast}` : '';

    const submitData = {
      name: formData.name,
      targetType: formData.targetType,
      targetHousehold: formData.targetHousehold,
      zipcode: formData.zipcode,
      address: fullAddress,
      detailAddress: formData.detailAddress,
      mobilePhone: `${formData.mobilePhoneArea}${formData.mobilePhoneMiddle}${formData.mobilePhoneLast}`,
      phone: phone,
      applicationReason: formData.applicationReason,
      directions: formData.directions
    };

    onSave(submitData);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {target ? '대상자 수정' : '대상자 추가'}
          </ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">
              대상자명<RequiredStar>*</RequiredStar>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="대상자명을 입력하세요"
              className={errors.name ? 'error' : ''}
              required
            />
            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="targetType">
              대상구분<RequiredStar>*</RequiredStar>
            </Label>
            <Select
              id="targetType"
              name="targetType"
              value={formData.targetType}
              onChange={handleChange}
              className={errors.targetType ? 'error' : ''}
              required
            >
              <option value="">선택하세요</option>
              <option value="수급자">수급자</option>
              <option value="차상위">차상위</option>
              <option value="일반저소득">일반저소득</option>
            </Select>
            {errors.targetType && <ErrorMessage>{errors.targetType}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="targetHousehold">
              대상가구<RequiredStar>*</RequiredStar>
            </Label>
            <Select
              id="targetHousehold"
              name="targetHousehold"
              value={formData.targetHousehold}
              onChange={handleChange}
              className={errors.targetHousehold ? 'error' : ''}
              required
            >
              <option value="">선택하세요</option>
              <option value="독거어르신">독거어르신</option>
              <option value="조손가구">조손가구</option>
              <option value="저소득1인가구">저소득1인가구</option>
              <option value="겨울철에너지취약계층">겨울철에너지취약계층</option>
            </Select>
            {errors.targetHousehold && <ErrorMessage>{errors.targetHousehold}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="zipcode">
              주소<RequiredStar>*</RequiredStar>
            </Label>
            <AddressGroup>
              <AddressInput
                id="zipcode"
                name="zipcode"
                type="text"
                className={`zipcode ${errors.zipcode ? 'error' : ''}`}
                value={formData.zipcode}
                onChange={handleChange}
                placeholder="우편번호"
                readOnly
              />
              <AddressButton type="button" onClick={handleAddressSearch}>
                주소검색
              </AddressButton>
            </AddressGroup>
            <AddressInput
              name="address"
              type="text"
              className={`address ${errors.address ? 'error' : ''}`}
              value={formData.address}
              onChange={handleChange}
              placeholder="기본주소"
              readOnly
              style={{ marginTop: '0.5rem' }}
            />
            <Input
              name="detailAddress"
              type="text"
              value={formData.detailAddress}
              onChange={handleChange}
              placeholder="상세주소를 입력하세요"
              style={{ marginTop: '0.5rem' }}
            />
            {(errors.zipcode || errors.address) && <ErrorMessage>{errors.zipcode || errors.address}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="mobilePhoneArea">
              핸드폰<RequiredStar>*</RequiredStar>
            </Label>
            <PhoneInputGroup>
              <PhoneSelect
                id="mobilePhoneArea"
                name="mobilePhoneArea"
                value={formData.mobilePhoneArea}
                onChange={handleChange}
              >
                <option value="010">010</option>
                <option value="011">011</option>
                <option value="016">016</option>
                <option value="017">017</option>
                <option value="018">018</option>
                <option value="019">019</option>
              </PhoneSelect>
              <PhoneInput
                type="tel"
                name="mobilePhoneMiddle"
                value={formData.mobilePhoneMiddle}
                onChange={handleChange}
                maxLength="4"
                className={errors.mobilePhoneMiddle ? 'error' : ''}
              />
              <PhoneInput
                type="tel"
                name="mobilePhoneLast"
                value={formData.mobilePhoneLast}
                onChange={handleChange}
                maxLength="4"
                className={errors.mobilePhoneLast ? 'error' : ''}
              />
            </PhoneInputGroup>
            {(errors.mobilePhoneMiddle || errors.mobilePhoneLast) && (
              <ErrorMessage>{errors.mobilePhoneMiddle || errors.mobilePhoneLast}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="phoneArea">집전화</Label>
            <PhoneInputGroup>
              <PhoneSelect
                id="phoneArea"
                name="phoneArea"
                value={formData.phoneArea}
                onChange={handleChange}
              >
                <option value="02">02</option>
                <option value="031">031</option>
                <option value="032">032</option>
                <option value="033">033</option>
                <option value="041">041</option>
                <option value="042">042</option>
                <option value="043">043</option>
                <option value="051">051</option>
                <option value="052">052</option>
                <option value="053">053</option>
                <option value="061">061</option>
                <option value="062">062</option>
                <option value="063">063</option>
              </PhoneSelect>
              <PhoneInput
                type="tel"
                name="phoneMiddle"
                value={formData.phoneMiddle}
                onChange={handleChange}
                maxLength="4"
                className={errors.phoneMiddle ? 'error' : ''}
              />
              <PhoneInput
                type="tel"
                name="phoneLast"
                value={formData.phoneLast}
                onChange={handleChange}
                maxLength="4"
                className={errors.phoneLast ? 'error' : ''}
              />
            </PhoneInputGroup>
            {(errors.phoneMiddle || errors.phoneLast) && (
              <ErrorMessage>{errors.phoneMiddle || errors.phoneLast}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="applicationReason">
              신청사유 (1000자까지)<RequiredStar>*</RequiredStar>
            </Label>
            <TextArea
              id="applicationReason"
              name="applicationReason"
              value={formData.applicationReason}
              onChange={handleChange}
              placeholder="신청사유를 입력하세요"
              maxLength="1000"
              className={errors.applicationReason ? 'error' : ''}
              style={{ minHeight: '100px' }}
            />
            <div style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'right', marginTop: '0.25rem' }}>
              {formData.applicationReason.length}/1000
            </div>
            {errors.applicationReason && <ErrorMessage>{errors.applicationReason}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="directions">찾아가는길 (500자까지)</Label>
            <TextArea
              id="directions"
              name="directions"
              value={formData.directions}
              onChange={handleChange}
              placeholder="찾아가는길을 입력하세요"
              maxLength="500"
              style={{ minHeight: '60px' }}
            />
            <div style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'right', marginTop: '0.25rem' }}>
              {formData.directions.length}/500
            </div>
          </FormGroup>

          <ButtonGroup>
            <Button type="button" className="cancel" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" className="save">
              {target ? '수정' : '추가'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default TargetModal;
