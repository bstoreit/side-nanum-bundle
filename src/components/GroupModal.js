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

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
  margin-right: 1rem;
  word-break: keep-all;
  overflow-wrap: break-word;

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
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  
  &.required {
    color: #dc2626;
  }
`;

const RequiredStar = styled.span`
  color: #dc2626;
  margin-left: 2px;
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const MessageContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
  max-width: 400px;
`;

const Message = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  
  &.success {
    background-color: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
  }
  
  &.error {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
  }
  
  &.info {
    background-color: #dbeafe;
    color: #1e40af;
    border: 1px solid #93c5fd;
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

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: white;
  width: 80px;
  min-width: 80px;
  max-width: 80px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
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
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  width: 100%;
  max-width: 100px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  @media (max-width: 768px) {
    max-width: 100%;
    font-size: 16px; /* iOS 줌 방지 */
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #85a65c;
    box-shadow: 0 0 0 3px rgba(133, 166, 92, 0.1);
  }
  
  &.error {
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }

  @media (max-width: 768px) {
    font-size: 16px; /* iOS 줌 방지 */
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #85a65c;
    box-shadow: 0 0 0 3px rgba(133, 166, 92, 0.1);
  }
  
  &.error {
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }

  @media (max-width: 768px) {
    font-size: 16px; /* iOS 줌 방지 */
    min-height: 100px;
  }
`;


const AddressGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
`;

const AddressInput = styled(Input)`
  &.zipcode {
    width: 120px;
  }

  &.address {
    flex: 1;
  }
`;

const AddressButton = styled.button`
  padding: 0.75rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2563eb;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &.primary {
    background: #85a65c;
    color: white;

    &:hover {
      transform: translateY(-1px);
    }
  }

  &.secondary {
    background-color: #f3f4f6;
    color: #374151;

    &:hover {
      background-color: #e5e7eb;
    }
  }
`;

const GroupModal = ({ group, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    organizationName: '',
    managerName: '',
    zipcode: '',
    address: '',
    detailAddress: '',
    mobilePhoneArea: '010',
    mobilePhoneMiddle: '',
    mobilePhoneLast: '',
    phoneArea: '02',
    phoneMiddle: '',
    phoneLast: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

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
    if (group) {
      const mobilePhone = parsePhoneNumber(group.mobile_phone || '');
      const officePhone = parsePhoneNumber(group.office_phone || '');
      
      setFormData({
        name: group.group_name || '',
        organizationName: group.org_name || '',
        managerName: group.contact_name || '',
        zipcode: group.zipcode || '',
        address: group.address1 || '',
        detailAddress: group.address2 || '',
        mobilePhoneArea: mobilePhone.area || '010',
        mobilePhoneMiddle: mobilePhone.middle || '',
        mobilePhoneLast: mobilePhone.last || '',
        phoneArea: officePhone.area || '02',
        phoneMiddle: officePhone.middle || '',
        phoneLast: officePhone.last || '',
        description: group.description || ''
      });
    } else {
      setFormData({
        name: '',
        organizationName: '',
        managerName: '',
        zipcode: '',
        address: '',
        detailAddress: '',
        mobilePhoneArea: '010',
        mobilePhoneMiddle: '',
        mobilePhoneLast: '',
        phoneArea: '02',
        phoneMiddle: '',
        phoneLast: '',
        description: ''
      });
    }
  }, [group]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return '그룹명을 입력해주세요.';
        if (value.length > 15) return '그룹명은 15자 이내로 입력해주세요.';
        return '';
      case 'organizationName':
        if (!value.trim()) return '기관명을 입력해주세요.';
        if (value.length > 25) return '기관명은 25자 이내로 입력해주세요.';
        return '';
      case 'managerName':
        if (!value.trim()) return '담당자명을 입력해주세요.';
        if (value.length > 20) return '담당자명은 20자 이내로 입력해주세요.';
        return '';
      case 'address':
        if (!value.trim()) return '주소를 입력해주세요.';
        return '';
    case 'mobilePhoneMiddle':
      // 핸드폰 중간번호는 필수 입력
      if (!value.trim()) {
        return '핸드폰 번호를 입력해주세요.';
      }
      // 핸드폰 중간번호는 반드시 4자리
      if (value.trim().length !== 4) {
        return '핸드폰 중간번호는 4자리여야 합니다.';
      }
      return '';
    case 'mobilePhoneLast':
      // 핸드폰 끝번호는 필수 입력
      if (!value.trim()) {
        return '핸드폰 번호를 입력해주세요.';
      }
      // 핸드폰 끝번호는 반드시 4자리
      if (value.trim().length !== 4) {
        return '핸드폰 끝번호는 4자리여야 합니다.';
      }
      return '';
      case 'phoneMiddle':
        // 일반전화 중간번호 자릿수 검증
        if (value.trim()) {
          if (value.trim().length < 3 || value.trim().length > 4) {
            return '일반전화 중간번호는 3~4자리여야 합니다.';
          }
        }
        return '';
      case 'phoneLast':
        // 일반전화 끝번호 자릿수 검증
        if (value.trim()) {
          if (value.trim().length !== 4) {
            return '일반전화 끝번호는 4자리여야 합니다.';
          }
        }
        return '';
      case 'description':
        if (value && value.length > 500) return '설명은 500자 이내로 입력해주세요.';
        return '';
      default:
        return '';
    }
  };

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // 숫자만 추출
    const numbers = phone.replace(/\D/g, '');
    
    // 핸드폰 번호 (010, 011, 016, 017, 018, 019)
    if (numbers.length === 11 && numbers.startsWith('01')) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    }
    
    // 일반전화 번호 (02, 031, 032, 033, 041, 042, 043, 044, 051, 052, 053, 054, 055, 061, 062, 063, 064)
    if (numbers.length === 10) {
      if (numbers.startsWith('02')) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      } else {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
      }
    }
    
    if (numbers.length === 9) {
      if (numbers.startsWith('02')) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
      } else {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5)}`;
      }
    }
    
    // 포맷팅이 안되는 경우 원본 반환
    return phone;
  };

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
    const errorMessage = validateField(name, value);
    
    // 핸드폰 필드인 경우 두 필드 모두 검증
    if (name === 'mobilePhoneMiddle' || name === 'mobilePhoneLast') {
      const updatedFormData = { ...formData, [name]: value };
      
      // 핸드폰 필수 입력 검증
      const phoneError = '핸드폰 번호를 입력해주세요.';
      const middleError = !updatedFormData.mobilePhoneMiddle.trim() ? phoneError : 
                         (updatedFormData.mobilePhoneMiddle.trim().length !== 4 ? '핸드폰 중간번호는 4자리여야 합니다.' : '');
      const lastError = !updatedFormData.mobilePhoneLast.trim() ? phoneError : 
                       (updatedFormData.mobilePhoneLast.trim().length !== 4 ? '핸드폰 끝번호는 4자리여야 합니다.' : '');
      
      setErrors(prev => ({
        ...prev,
        mobilePhoneMiddle: middleError,
        mobilePhoneLast: lastError
      }));
    } 
    // 일반전화 필드인 경우 - 하나라도 입력되면 모든 필드 필수
    else if (name === 'phoneMiddle' || name === 'phoneLast') {
      const updatedFormData = { ...formData, [name]: value };
      const hasPhoneMiddle = updatedFormData.phoneMiddle && updatedFormData.phoneMiddle.trim();
      const hasPhoneLast = updatedFormData.phoneLast && updatedFormData.phoneLast.trim();
      
      if (hasPhoneMiddle || hasPhoneLast) {
        // 하나라도 입력되면 모든 필드 필수 + 자릿수 검증
        const middleError = !updatedFormData.phoneMiddle.trim() ? '일반전화 번호를 모두 입력해주세요.' :
                           (updatedFormData.phoneMiddle.trim().length < 3 || updatedFormData.phoneMiddle.trim().length > 4 ? '일반전화 중간번호는 3~4자리여야 합니다.' : '');
        const lastError = !updatedFormData.phoneLast.trim() ? '일반전화 번호를 모두 입력해주세요.' :
                         (updatedFormData.phoneLast.trim().length !== 4 ? '일반전화 끝번호는 4자리여야 합니다.' : '');
        
        setErrors(prev => ({
          ...prev,
          phoneMiddle: middleError,
          phoneLast: lastError
        }));
      } else {
        // 아무것도 입력되지 않으면 에러 없음
        setErrors(prev => ({
          ...prev,
          phoneMiddle: '',
          phoneLast: ''
        }));
      }
    } else {
      setErrors(prev => ({
        ...prev,
        [name]: errorMessage
      }));
    }
  };

  const handleAddressSearch = () => {
    // 다음 우편번호 서비스 사용
    new window.daum.Postcode({
      oncomplete: function(data) {
        // 우편번호와 주소 정보를 해당 필드에 넣는다.
        const newAddress = data.address;
        setFormData(prev => ({
          ...prev,
          zipcode: data.zonecode,
          address: newAddress
        }));
        
        // 주소 실시간 검증
        const errorMessage = validateField('address', newAddress);
        setErrors(prev => ({
          ...prev,
          address: errorMessage
        }));
      }
    }).open();
  };

  const validateForm = () => {
    const newErrors = {};
    
    // 필수 필드 검증 (5개 항목)
    if (!formData.name.trim()) {
      newErrors.name = '그룹명을 입력해주세요.';
    } else if (formData.name.length > 15) {
      newErrors.name = '그룹명은 15자 이내로 입력해주세요.';
    }
    
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = '기관명을 입력해주세요.';
    } else if (formData.organizationName.length > 25) {
      newErrors.organizationName = '기관명은 25자 이내로 입력해주세요.';
    }
    
    if (!formData.managerName.trim()) {
      newErrors.managerName = '담당자명을 입력해주세요.';
    } else if (formData.managerName.length > 20) {
      newErrors.managerName = '담당자명은 20자 이내로 입력해주세요.';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요.';
    }
    
    if (!formData.mobilePhoneMiddle.trim()) {
      newErrors.mobilePhoneMiddle = '핸드폰 번호를 입력해주세요.';
    }
    if (!formData.mobilePhoneLast.trim()) {
      newErrors.mobilePhoneLast = '핸드폰 번호를 입력해주세요.';
    }
    
    // 핸드폰 중간번호와 끝번호 중 하나라도 비어있으면 공통 메시지 표시
    if (!formData.mobilePhoneMiddle.trim() || !formData.mobilePhoneLast.trim()) {
      const phoneError = '핸드폰 번호를 입력해주세요.';
      newErrors.mobilePhoneMiddle = phoneError;
      newErrors.mobilePhoneLast = phoneError;
    }
    
    // 핸드폰 자릿수 검증 (입력된 값이 있을 때만)
    if (formData.mobilePhoneMiddle.trim() && formData.mobilePhoneMiddle.trim().length !== 4) {
      newErrors.mobilePhoneMiddle = '핸드폰 중간번호는 4자리여야 합니다.';
    }
    if (formData.mobilePhoneLast.trim() && formData.mobilePhoneLast.trim().length !== 4) {
      newErrors.mobilePhoneLast = '핸드폰 끝번호는 4자리여야 합니다.';
    }
    
    // 일반전화 검증 - 하나라도 입력되면 모든 필드 필수
    const hasPhoneMiddle = formData.phoneMiddle && formData.phoneMiddle.trim();
    const hasPhoneLast = formData.phoneLast && formData.phoneLast.trim();
    
    if (hasPhoneMiddle || hasPhoneLast) {
      // 하나라도 입력되면 모든 필드 필수
      if (!formData.phoneMiddle.trim()) {
        newErrors.phoneMiddle = '일반전화 번호를 모두 입력해주세요.';
      }
      if (!formData.phoneLast.trim()) {
        newErrors.phoneLast = '일반전화 번호를 모두 입력해주세요.';
      }
    }
    
    // 일반전화 자릿수 검증 (입력된 값이 있을 때만)
    if (formData.phoneMiddle.trim() && (formData.phoneMiddle.trim().length < 3 || formData.phoneMiddle.trim().length > 4)) {
      newErrors.phoneMiddle = '일반전화 중간번호는 3~4자리여야 합니다.';
    }
    if (formData.phoneLast.trim() && formData.phoneLast.trim().length !== 4) {
      newErrors.phoneLast = '일반전화 끝번호는 4자리여야 합니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!validateForm()) {
      showMessage('error', '입력 정보를 확인해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 주소 정보를 합쳐서 저장
      const fullAddress = `${formData.zipcode} ${formData.address}`.trim();
      // 일반전화가 비어있는지 확인
      const phoneMiddle = formData.phoneMiddle.trim();
      const phoneLast = formData.phoneLast.trim();
      const phone = (phoneMiddle && phoneLast) ? `${formData.phoneArea}${phoneMiddle}${phoneLast}` : '';

      const submitData = {
        name: formData.name,
        organizationName: formData.organizationName,
        managerName: formData.managerName,
        zipcode: formData.zipcode,
        address: fullAddress,
        detailAddress: formData.detailAddress,
        mobilePhone: `${formData.mobilePhoneArea}${formData.mobilePhoneMiddle}${formData.mobilePhoneLast}`,
        phone: phone,
        description: null
      };

      await onSave(submitData);
      showMessage('success', group ? '그룹이 수정되었습니다.' : '그룹이 추가되었습니다.');
    } catch (error) {
      console.error('저장 중 오류가 발생했습니다:', error);
      showMessage('error', '저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {message && (
        <MessageContainer>
          <Message className={message.type}>
            {message.text}
          </Message>
        </MessageContainer>
      )}
      <ModalOverlay>
        <ModalContent>
        <ModalHeader>
          <ModalTitle>
            {group ? '그룹 수정' : '신청명단 작성'}
          </ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name" className="required">
              그룹명 <RequiredStar>*</RequiredStar>
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="그룹명을 입력하세요"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="organizationName" className="required">
              기관명 <RequiredStar>*</RequiredStar>
            </Label>
            <Input
              type="text"
              id="organizationName"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              placeholder="기관명을 입력하세요"
              className={errors.organizationName ? 'error' : ''}
            />
            {errors.organizationName && <ErrorMessage>{errors.organizationName}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="managerName" className="required">
              담당자명 <RequiredStar>*</RequiredStar>
            </Label>
            <Input
              type="text"
              id="managerName"
              name="managerName"
              value={formData.managerName}
              onChange={handleChange}
              placeholder="담당자명을 입력하세요"
              className={errors.managerName ? 'error' : ''}
            />
            {errors.managerName && <ErrorMessage>{errors.managerName}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="zipcode" className="required">
              주소 <RequiredStar>*</RequiredStar>
            </Label>
            <AddressGroup>
              <AddressInput
                type="text"
                id="zipcode"
                name="zipcode"
                className={`zipcode ${errors.address ? 'error' : ''}`}
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
              type="text"
              name="address"
              className={`address ${errors.address ? 'error' : ''}`}
              value={formData.address}
              onChange={handleChange}
              placeholder="기본주소"
              readOnly
              style={{ marginTop: '0.5rem' }}
            />
            <Input
              type="text"
              name="detailAddress"
              value={formData.detailAddress}
              onChange={handleChange}
              placeholder="상세주소를 입력하세요"
              style={{ marginTop: '0.5rem' }}
            />
            {errors.address && <ErrorMessage>{errors.address}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="mobilePhoneArea" className="required">
              핸드폰 <RequiredStar>*</RequiredStar>
            </Label>
            <PhoneInputGroup>
              <Select
                id="mobilePhoneArea"
                name="mobilePhoneArea"
                value={formData.mobilePhoneArea}
                onChange={handleChange}
                className={errors.mobilePhoneMiddle ? 'error' : ''}
              >
                <option value="010">010</option>
                <option value="011">011</option>
                <option value="016">016</option>
                <option value="017">017</option>
                <option value="018">018</option>
                <option value="019">019</option>
              </Select>
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
            <Label htmlFor="phoneArea">
              일반전화
            </Label>
            <PhoneInputGroup>
              <Select
                id="phoneArea"
                name="phoneArea"
                value={formData.phoneArea}
                onChange={handleChange}
                className={errors.phoneMiddle ? 'error' : ''}
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
              </Select>
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

          <ButtonGroup>
            <Button type="button" className="secondary" onClick={onClose} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" className="primary" disabled={isSubmitting}>
              {isSubmitting ? '처리중...' : (group ? '수정' : '추가')}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
    </>
  );
};

export default GroupModal;
