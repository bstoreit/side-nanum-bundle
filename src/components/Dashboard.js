import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import GroupGrid from './GroupGrid';
import TargetList from './TargetList';
import GroupModal from './GroupModal';
import ConfirmModal from './ConfirmModal';
import { businessAPI, targetAPI } from '../services/api';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #f8fafc;
`;

const Header = styled.header`
  background: #85a65c;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const LogoImage = styled.img`
  height: 40px;
  width: auto;
  object-fit: contain;

  @media (max-width: 768px) {
    height: 32px;
  }
`;

const Separator = styled.div`
  height: 30px;
  width: 1px;
  background-color: rgba(255, 255, 255, 0.5);
  margin: 0 0.5rem;
`;

const Logo = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 1rem;
    white-space: normal;
    text-align: center;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
    flex-direction: column;
  }
`;

const BusinessName = styled.span`
  font-size: 1.1rem;
  font-weight: 500;
  color: #374151;

  @media (max-width: 768px) {
    font-size: 1rem;
    text-align: center;
  }
`;

const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #dc2626;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1.5rem;
    font-size: 0.85rem;
  }
`;

const MainContent = styled.div`
  display: flex;
  min-height: calc(100vh - 80px);

  @media (max-width: 768px) {
    flex-direction: column;
    min-height: calc(100vh - 120px);
  }
`;

const LeftPanel = styled.div`
  flex: ${props => props.isSplit ? '1' : '1'};
  padding: 2rem;
  transition: flex 0.3s ease;

  @media (max-width: 768px) {
    padding: 1rem;
    flex: none;
    order: 2;
  }
`;

const AddGroupButton = styled.button`
  margin-bottom: 1.5rem;
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
    width: 100%;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    margin-bottom: 1rem;
  }
`;

const RightPanel = styled.div`
  flex: ${props => props.isSplit ? '1' : '0'};
  background: white;
  border-left: 1px solid #e5e7eb;
  transition: flex 0.3s ease;
  overflow: hidden;
  min-width: ${props => props.isSplit ? '400px' : '0'};

  @media (max-width: 768px) {
    border-left: none;
    border-top: 1px solid #e5e7eb;
    min-width: auto;
    flex: none;
    max-height: 60vh;
    order: 1;
  }
`;

const Dashboard = ({ user, onLogout }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isSplit, setIsSplit] = useState(false);
  const [targets, setTargets] = useState([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  useEffect(() => {
    // Lambda API에서 사업 목록 로드
    const loadBusinesses = async () => {
      try {
        const response = await businessAPI.getBusinesses();
        if (response.ok && response.data) {
          setGroups(response.data);
        }
      } catch (error) {
        console.error('사업 목록 로드 실패:', error);
        // 오류 시 빈 배열로 설정
        setGroups([]);
      }
    };

    loadBusinesses();
  }, []);

  const handleGroupSelect = async (group) => {
    setSelectedGroup(group);
    setIsSplit(true);
    
    // Lambda API에서 대상자 목록 로드
    try {
      const response = await targetAPI.getTargets(group.group_id);
      if (response.ok && response.data) {
        setTargets(response.data);
      } else {
        setTargets([]);
      }
    } catch (error) {
      console.error('대상자 목록 로드 실패:', error);
      setTargets([]);
    }
  };

  const handleCloseSplit = () => {
    setIsSplit(false);
    setSelectedGroup(null);
    setTargets([]);
  };

  const handleTargetUpdate = async (updatedTargets) => {
    setTargets(updatedTargets);
    
    // 그룹 리스트도 새로고침하여 대상자 수 업데이트
    try {
      const response = await businessAPI.getBusinesses();
      if (response.ok && response.data) {
        setGroups(response.data);
      }
    } catch (error) {
      console.error('그룹 목록 새로고침 실패:', error);
    }
  };

  const handleAddGroup = () => {
    setEditingGroup(null);
    setIsGroupModalOpen(true);
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setIsGroupModalOpen(true);
  };

  const handleDeleteGroup = (group) => {
    setGroupToDelete(group);
    setIsDeleteModalOpen(true);
  };

  const handleSaveGroup = async (groupData) => {
    try {
      if (editingGroup) {
        // 수정
        await businessAPI.updateBusiness(editingGroup.group_id, groupData);
      } else {
        // 추가
        await businessAPI.createBusiness(groupData);
      }
      
      // 목록 새로고침
      const response = await businessAPI.getBusinesses();
      if (response.ok && response.data) {
        setGroups(response.data);
      }
      
      setIsGroupModalOpen(false);
      setEditingGroup(null);
    } catch (error) {
      console.error('사업 저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleConfirmDeleteGroup = async () => {
    try {
      await businessAPI.deleteBusiness(groupToDelete.group_id);
      
      // 목록 새로고침
      const response = await businessAPI.getBusinesses();
      if (response.ok && response.data) {
        setGroups(response.data);
      }
      
      setIsDeleteModalOpen(false);
      setGroupToDelete(null);
      
      // 선택된 그룹이 삭제된 경우 선택 해제
      if (selectedGroup && selectedGroup.group_id === groupToDelete.group_id) {
        setSelectedGroup(null);
        setIsSplit(false);
        setTargets([]);
      }
    } catch (error) {
      console.error('사업 삭제 실패:', error);
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <DashboardContainer>
      <Header>
        <LogoContainer>
          <Logo>아름다운가게</Logo>
          <Separator />
          <Logo>나눔보따리 지원대상자 등록/엑셀받기</Logo>
        </LogoContainer>
        <UserInfo>
          <BusinessName>{user.businessName}</BusinessName>
          <LogoutButton onClick={onLogout}>
            로그아웃
          </LogoutButton>
        </UserInfo>
      </Header>

      <MainContent>
        <LeftPanel isSplit={isSplit}>
          <AddGroupButton onClick={handleAddGroup}>
            + 그룹 추가
          </AddGroupButton>
          <GroupGrid 
            groups={groups}
            onGroupSelect={handleGroupSelect}
            selectedGroup={selectedGroup}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
          />
        </LeftPanel>

        <RightPanel isSplit={isSplit}>
          {isSplit && selectedGroup && (
            <TargetList
              group={selectedGroup}
              targets={targets}
              onClose={handleCloseSplit}
              onTargetUpdate={handleTargetUpdate}
            />
          )}
        </RightPanel>
      </MainContent>

      {isGroupModalOpen && (
        <GroupModal
          group={editingGroup}
          onSave={handleSaveGroup}
          onClose={() => {
            setIsGroupModalOpen(false);
            setEditingGroup(null);
          }}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmModal
          title="그룹 삭제"
          message={`${groupToDelete?.group_name} 그룹을 삭제하시겠습니까?`}
          onConfirm={handleConfirmDeleteGroup}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setGroupToDelete(null);
          }}
        />
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
