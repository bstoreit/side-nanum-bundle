import React from 'react';
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
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  text-align: center;
`;

const Icon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const Message = styled.p`
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &.confirm {
    background-color: #ef4444;
    color: white;

    &:hover {
      background-color: #dc2626;
    }
  }

  &.cancel {
    background-color: #f3f4f6;
    color: #6b7280;

    &:hover {
      background-color: #e5e7eb;
    }
  }
`;

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <ModalOverlay onClick={onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Icon>⚠️</Icon>
        <Title>{title}</Title>
        <Message>{message}</Message>
        <ButtonGroup>
          <Button className="cancel" onClick={onCancel}>
            취소
          </Button>
          <Button className="confirm" onClick={onConfirm}>
            확인
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ConfirmModal;
