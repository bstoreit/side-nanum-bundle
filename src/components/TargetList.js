import React, { useState } from 'react';
import styled from 'styled-components';
import TargetModal from './TargetModal';
import ConfirmModal from './ConfirmModal';
import * as XLSX from 'xlsx';
import { targetAPI } from '../services/api';

const TargetListContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    margin-bottom: 0.75rem;
  }
`;

const Title = styled.h2`
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

const GroupInfo = styled.div`
  color: #64748b;
  font-size: 0.95rem;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ActionBar = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  width: 250px;

  &:focus {
    border-color: #85a65c;
  }

  @media (max-width: 768px) {
    width: 100%;
    font-size: 16px; /* iOS 줌 방지 */
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;

  @media (max-width: 768px) {
    width: 100%;
    gap: 0.5rem;
  }
`;

const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    flex: 1;
    padding: 0.875rem 1rem;
    font-size: 0.85rem;
  }
`;

const ExcelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: transform 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    flex: 1;
    padding: 0.875rem 1rem;
    font-size: 0.85rem;
    white-space: normal;
  }
`;

const ListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const TargetItem = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 0.875rem;
    margin-bottom: 0.5rem;
  }
`;

const TargetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const TargetName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const TargetStatus = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => props.status === 'active' ? '#dcfce7' : '#fef3c7'};
  color: ${props => props.status === 'active' ? '#166534' : '#92400e'};

  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
`;

const TargetDetails = styled.div`
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }
`;

const TargetActions = styled.div`
  display: flex;
  gap: 0.5rem;

  @media (max-width: 768px) {
    gap: 0.375rem;
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &.edit {
    background-color: #3b82f6;
    color: white;

    &:hover {
      background-color: #2563eb;
    }
  }

  &.delete {
    background-color: #ef4444;
    color: white;

    &:hover {
      background-color: #dc2626;
    }
  }

  @media (max-width: 768px) {
    padding: 0.625rem 0.875rem;
    font-size: 0.75rem;
    flex: 1;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #64748b;

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const EmptyIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const EmptyText = styled.p`
  font-size: 1rem;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const TargetList = ({ group, targets, onClose, onTargetUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState(null);

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // 숫자만 추출
    const numbers = phone.replace(/\D/g, '');
    
    // 핸드폰 번호 (010, 011, 016, 017, 018, 019) - 11자리
    if (numbers.length === 11 && (numbers.startsWith('010') || numbers.startsWith('011') || 
                                 numbers.startsWith('016') || numbers.startsWith('017') || 
                                 numbers.startsWith('018') || numbers.startsWith('019'))) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    }
    
    // 서울 지역번호 (02) - 9자리 또는 10자리
    if (numbers.startsWith('02')) {
      if (numbers.length === 9) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
      } else if (numbers.length === 10) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      }
    }
    
    // 기타 지역번호 (031, 032, 033, 041, 042, 043, 051, 052, 053, 061, 062, 063) - 10자리
    if (numbers.length === 10 && (numbers.startsWith('031') || numbers.startsWith('032') || numbers.startsWith('033') ||
                                 numbers.startsWith('041') || numbers.startsWith('042') || numbers.startsWith('043') ||
                                 numbers.startsWith('051') || numbers.startsWith('052') || numbers.startsWith('053') ||
                                 numbers.startsWith('061') || numbers.startsWith('062') || numbers.startsWith('063'))) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    }
    
    // 기타 10자리 번호
    if (numbers.length === 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    }
    
    // 11자리 이상 번호
    if (numbers.length >= 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
    
    return phone; // 포맷팅할 수 없는 경우 원본 반환
  };

  const filteredTargets = targets.filter(target =>
    (target.name && target.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (target.mobilePhone && target.mobilePhone.includes(searchTerm)) ||
    (target.phone && target.phone.includes(searchTerm)) ||
    (target.targetType && target.targetType.includes(searchTerm)) ||
    (target.targetHousehold && target.targetHousehold.includes(searchTerm))
  );

  const handleEdit = (target) => {
    setSelectedTarget(target);
    setIsModalOpen(true);
  };

  const handleDelete = (target) => {
    setTargetToDelete(target);
    setIsDeleteModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedTarget(null);
    setIsModalOpen(true);
  };

  const handleSave = async (targetData) => {
    try {
      if (selectedTarget) {
        // 수정
        await targetAPI.updateTarget(group.group_id, selectedTarget.id, targetData);
        
        // 목록 새로고침
        const response = await targetAPI.getTargets(group.group_id);
        if (response.ok && response.data) {
          onTargetUpdate(response.data);
        }
      } else {
        // 추가
        const response = await targetAPI.createTarget(group.group_id, targetData);
        if (response.ok) {
          // 목록 새로고침
          const targetsResponse = await targetAPI.getTargets(group.group_id);
          if (targetsResponse.ok && targetsResponse.data) {
            onTargetUpdate(targetsResponse.data);
          }
        }
      }
      
      setIsModalOpen(false);
      setSelectedTarget(null);
    } catch (error) {
      console.error('대상자 저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await targetAPI.deleteTarget(group.group_id, targetToDelete.id);
      
      // 목록 새로고침
      const response = await targetAPI.getTargets(group.group_id);
      if (response.ok && response.data) {
        onTargetUpdate(response.data);
      }
      
      setIsDeleteModalOpen(false);
      setTargetToDelete(null);
    } catch (error) {
      console.error('대상자 삭제 실패:', error);
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleExcelDownload = () => {
    // 엑셀 워크북 생성
    const wb = XLSX.utils.book_new();
    
    // 워크시트 데이터 생성
    const wsData = [];
    
    // 1. 단체정보 섹션
    wsData.push(['1.단체정보']);
    wsData.push(['단체명', '']);
    wsData.push(['주소', '']);
    wsData.push(['담당자명', '']);
    wsData.push(['핸드폰', '']);
    wsData.push(['일반전화', '']);
    wsData.push([]);
    
    // 2. 추천대상 정보 섹션
    wsData.push(['2.추천대상정보']);
    wsData.push(['연번', '대상자명', '대상구분', '대상가구', '우편번호', '기본주소', '상세주소', '핸드폰', '집전화', '신청사유', '찾아가는길']);
    
    // wrapText 함수 제거 - 기본 텍스트 사용

    // 대상자 데이터 추가
    targets.forEach((target, index) => {
      const addressParts = target.address ? target.address.split(' ') : ['', ''];
      const zipcode = addressParts[0] || '';
      const roadAddress = addressParts.slice(1).join(' ') || '';
      
      wsData.push([
        index + 1,
        target.name || '',
        target.targetType || '',
        target.targetHousehold || '',
        zipcode,
        roadAddress,
        target.detailAddress || '',
        target.mobilePhone || '',
        target.phone || '',
        target.applicationReason || '',
        target.directions || ''
      ]);
    });
    
    // 그룹 정보를 워크시트에 추가
    if (group) {
      // 단체정보 섹션에 그룹 정보 입력
      wsData[1][1] = group.group_name || '';  // 단체명
      wsData[2][1] = `${group.zipcode || ''} ${group.address1 || ''} ${group.address2 || ''}`.trim();  // 주소
      wsData[3][1] = group.contact_name || '';      // 담당자명
      wsData[4][1] = formatPhoneNumber(group.mobile_phone || '');      // 핸드폰
      wsData[5][1] = formatPhoneNumber(group.office_phone || '');      // 일반전화
    }
    
    // 워크시트 생성
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // 셀 스타일 설정 - 텍스트 줄바꿈 및 행 높이 설정
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    // 모든 셀에 기본 스타일 적용
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) continue;
        
        // 셀 스타일 설정
        ws[cellAddress].s = {
          alignment: {
            vertical: 'top',  // 위로 정렬
            horizontal: 'left',
            wrapText: true
          },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
      }
    }
    
    // 신청사유와 찾아가는길 컬럼에 특별한 스타일 적용 (추천대상정보 데이터 행만)
    const applicationReasonCol = 9; // 신청사유 컬럼 (J)
    const directionsCol = 10; // 찾아가는길 컬럼 (K)
    
    for (let row = 9; row <= range.e.r; row++) { // 추천대상정보 데이터 행부터 (9행부터)
      const applicationReasonCell = XLSX.utils.encode_cell({ r: row, c: applicationReasonCol });
      const directionsCell = XLSX.utils.encode_cell({ r: row, c: directionsCol });
      
      if (ws[applicationReasonCell]) {
        ws[applicationReasonCell].s = {
          alignment: {
            vertical: 'top',  // 위로 정렬 강화
            horizontal: 'left',
            wrapText: true,
            indent: 0
          },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
      }
      
      if (ws[directionsCell]) {
        ws[directionsCell].s = {
          alignment: {
            vertical: 'top',  // 위로 정렬 강화
            horizontal: 'left',
            wrapText: true,
            indent: 0
          },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
      }
    }
    
    // 셀 병합 설정 (새로운 구조에 맞게 수정)
    const merges = [];
    
    ws['!merges'] = merges;
    
    // 열 너비 설정
    ws['!cols'] = [
      { wch: 8 },  // 연번
      { wch: 15 }, // 대상자명
      { wch: 15 }, // 대상구분
      { wch: 20 }, // 대상가구
      { wch: 12 }, // 우편번호
      { wch: 25 }, // 기본주소
      { wch: 20 }, // 상세주소
      { wch: 15 }, // 핸드폰
      { wch: 15 }, // 집전화
      { wch: 50 }, // 신청사유 (넓게)
      { wch: 30 }  // 찾아가는길
    ];
    
    // 행 높이 설정 - 텍스트 줄수에 따라 가변적 조정
    ws['!rows'] = [];
    for (let row = range.s.r; row <= range.e.r; row++) {
      let rowHeight = 20; // 기본 높이
      
      // 1번 단체정보 섹션 (1-7행): 기본 높이 유지
      // 2번 추천대상정보 헤더 (8행): 기본 높이 유지  
      // 2번 추천대상정보 데이터 (9행부터): 텍스트 줄수에 따라 가변적 높이
      if (row >= 9) { // 추천대상정보 데이터 행부터
        const applicationReasonCell = XLSX.utils.encode_cell({ r: row, c: 9 }); // 신청사유 컬럼
        const directionsCell = XLSX.utils.encode_cell({ r: row, c: 10 }); // 찾아가는길 컬럼
        
        let maxLines = 1; // 최소 1줄
        
        // 신청사유 텍스트 줄수 계산
        if (ws[applicationReasonCell] && ws[applicationReasonCell].v) {
          const text = ws[applicationReasonCell].v.toString();
          const lines = text.split('\n').length;
          const wrappedLines = Math.ceil(text.length / 50); // 50자당 1줄로 계산
          maxLines = Math.max(maxLines, Math.max(lines, wrappedLines));
        }
        
        // 찾아가는길 텍스트 줄수 계산
        if (ws[directionsCell] && ws[directionsCell].v) {
          const text = ws[directionsCell].v.toString();
          const lines = text.split('\n').length;
          const wrappedLines = Math.ceil(text.length / 30); // 30자당 1줄로 계산
          maxLines = Math.max(maxLines, Math.max(lines, wrappedLines));
        }
        
        // 줄수에 따라 행 높이 계산 (최소 20, 최대 200)
        rowHeight = Math.min(200, Math.max(20, maxLines * 15 + 10));
      }
      
      ws['!rows'][row] = { hpt: rowHeight };
    }
    
    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(wb, ws, '대상자명단');
    
    // 엑셀 파일 다운로드
    const fileName = `${group?.name || '대상자'}_명단_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <TargetListContainer>
      <Header>
        <HeaderTop>
          <Title>대상자 관리</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </HeaderTop>
        <GroupInfo>
          {group.name} - 총 {targets.length}명
        </GroupInfo>
      </Header>

      <ActionBar>
        <SearchInput
          type="text"
          placeholder="대상자명, 전화번호, 대상구분, 대상가구로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ButtonGroup>
          <ExcelButton onClick={handleExcelDownload}>
            📊 엑셀받기
          </ExcelButton>
          <AddButton onClick={handleAdd}>
            + 대상자 추가
          </AddButton>
        </ButtonGroup>
      </ActionBar>

      <ListContainer>
        {filteredTargets.length === 0 ? (
          <EmptyState>
            <EmptyIcon>👥</EmptyIcon>
            <EmptyText>
              {searchTerm ? '검색 결과가 없습니다.' : '등록된 대상자가 없습니다.'}
            </EmptyText>
          </EmptyState>
        ) : (
          filteredTargets.map((target) => (
            <TargetItem key={target.id}>
              <TargetHeader>
                <TargetName>{target.name}</TargetName>
                <TargetStatus status={target.status}>
                  {target.status === 'active' ? '활성' : '비활성'}
                </TargetStatus>
              </TargetHeader>
              
              <TargetDetails>
                {target.targetType && <div>🏷️ 대상구분: {target.targetType}</div>}
                {target.targetHousehold && <div>🏠 대상가구: {target.targetHousehold}</div>}
                {target.mobilePhone && <div>📱 핸드폰: {formatPhoneNumber(target.mobilePhone)}</div>}
                {target.phone && <div>☎️ 집전화: {formatPhoneNumber(target.phone)}</div>}
                <div>📍 {target.address}</div>
                {target.detailAddress && <div>📍 상세: {target.detailAddress}</div>}
                {target.applicationReason && <div>📝 신청사유: {target.applicationReason.substring(0, 50)}{target.applicationReason.length > 50 ? '...' : ''}</div>}
                {target.directions && <div>🗺️ 찾아가는길: {target.directions}</div>}
                <div>📅 등록일: {target.registeredAt}</div>
              </TargetDetails>
              
              <TargetActions>
                <ActionButton 
                  className="edit"
                  onClick={() => handleEdit(target)}
                >
                  수정
                </ActionButton>
                <ActionButton 
                  className="delete"
                  onClick={() => handleDelete(target)}
                >
                  삭제
                </ActionButton>
              </TargetActions>
            </TargetItem>
          ))
        )}
      </ListContainer>

      {isModalOpen && (
        <TargetModal
          target={selectedTarget}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTarget(null);
          }}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmModal
          title="대상자 삭제"
          message={`${targetToDelete?.name}님을 삭제하시겠습니까?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setTargetToDelete(null);
          }}
        />
      )}
    </TargetListContainer>
  );
};

export default TargetList;
