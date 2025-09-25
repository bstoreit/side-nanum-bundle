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

const GroupDescription = styled.p`
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  line-height: 1.5;
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

const Status = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => props.status === 'active' ? '#dcfce7' : '#fef3c7'};
  color: ${props => props.status === 'active' ? '#166534' : '#92400e'};
`;

const ViewButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #85a65c;
  color: white;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
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

const GroupGrid = ({ groups, onGroupSelect, selectedGroup }) => {
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
          key={group.id}
          isSelected={selectedGroup?.id === group.id}
          onClick={() => onGroupSelect(group)}
        >
          <GroupName>{group.name}</GroupName>
          <GroupDescription>{group.description}</GroupDescription>
          
          <GroupInfo>
            <TargetCount>대상자 {group.targetCount}명</TargetCount>
            <Status status={group.status}>
              {group.status === 'active' ? '진행중' : '중단'}
            </Status>
          </GroupInfo>
          
          <ViewButton onClick={(e) => {
            e.stopPropagation();
            onGroupSelect(group);
          }}>
            보기
          </ViewButton>
        </GroupCard>
      ))}
    </GridContainer>
  );
};

export default GroupGrid;
