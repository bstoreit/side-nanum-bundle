import React from 'react';
import styled from 'styled-components';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const GroupCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 2px solid ${props => props.isSelected ? '#85a65c' : 'transparent'};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
`;

const GroupName = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;


const GroupDetails = styled.div`
  color: #64748b;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  line-height: 1.4;
`;

const DetailItem = styled.div`
  margin-bottom: 0.25rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const GroupInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const TargetCount = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #85a65c;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ViewButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: #85a65c;
  color: white;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 40px;

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
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #64748b;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: 1.1rem;
`;

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

const GroupGrid = ({ groups, onGroupSelect, selectedGroup, onEditGroup, onDeleteGroup }) => {
  if (groups.length === 0) {
    return (
      <EmptyState>
        <EmptyIcon>👥</EmptyIcon>
        <EmptyText>등록된 그룹이 없습니다.</EmptyText>
      </EmptyState>
    );
  }

  return (
    <GridContainer>
      {groups.map((group) => (
        <GroupCard
          key={group.group_id}
          isSelected={selectedGroup?.group_id === group.group_id}
          onClick={() => onGroupSelect(group)}
        >
          <GroupName>{group.group_name}</GroupName>
          
          <GroupDetails>
            <DetailItem>🏢 <strong>기관명:</strong> {group.org_name}</DetailItem>
            <DetailItem>👤 <strong>담당자:</strong> {group.contact_name}</DetailItem>
            <DetailItem>📍 <strong>주소:</strong> ({group.zipcode}) {group.address1} {group.address2}</DetailItem>
            <DetailItem>📱 <strong>핸드폰:</strong> {formatPhoneNumber(group.mobile_phone)}</DetailItem>
            <DetailItem>☎️ <strong>일반전화:</strong> {formatPhoneNumber(group.office_phone)}</DetailItem>
            <DetailItem>📅 <strong>등록일:</strong> {new Date(group.created_at).toLocaleDateString('ko-KR')}</DetailItem>
          </GroupDetails>
          
          <GroupInfo>
            <TargetCount>대상자 {group.target_count || 0}명</TargetCount>
          </GroupInfo>
          
          <ButtonGroup>
            <ViewButton onClick={(e) => {
              e.stopPropagation();
              onGroupSelect(group);
            }}>
              보기
            </ViewButton>
            <ActionButton 
              className="edit"
              onClick={(e) => {
                e.stopPropagation();
                onEditGroup(group);
              }}
              title="수정"
            >
              ✏️
            </ActionButton>
            <ActionButton 
              className="delete"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteGroup(group);
              }}
              title="삭제"
            >
              🗑️
            </ActionButton>
          </ButtonGroup>
        </GroupCard>
      ))}
    </GridContainer>
  );
};

export default GroupGrid;
