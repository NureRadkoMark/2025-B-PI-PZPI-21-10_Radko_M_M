import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {ModalWrapper} from "../components/ModalWrapper";
import {updateBonusesCostRequestModel} from "../api/models/bonusesCost/updateBonusesCostModels";
import apiService from "../api/apiService";
import {createBonusesCostRequestModel} from "../api/models/bonusesCost/createBonusesCostModels";

const FormContainer = styled.div`
  background: #e8f5e9;
  padding: 32px;
  border-radius: 16px;
  min-width: 400px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #c8e6c9;
  border-radius: 8px;
  font-size: 16px;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: -8px;
  color: #2e7d32;
`;

const Button = styled.button`
  padding: 12px;
  background-color: #66bb6a;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #43a047;
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  color: #388e3c;
  font-size: 16px;
  font-weight: bold;
`;

export default function BonusesCostModal({ onClose, existingCost }) {
    const token = localStorage.getItem('jwtToken');

    const isEditMode = Boolean(existingCost);

    const [currency, setCurrency] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            setCurrency(existingCost.Currency || '');
            setAmount(existingCost.AmountForOneBonus || '');
        }
    }, [existingCost, isEditMode]);

    const validate = () => {
        if (!currency || !amount) return 'Currency and amount are required';
        if (isNaN(amount) || Number(amount) <= 0) return 'Amount must be a positive number';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditMode) {
                const request = updateBonusesCostRequestModel(existingCost.BonusesCostID, currency, amount);
                const response = await apiService.updateBonusesCost(token, request);
                setSuccessMsg(`Updated: ${response.AmountForOneBonus} ${response.Currency} per bonus`);
            } else {
                const request = createBonusesCostRequestModel(currency, amount);
                const response = await apiService.createBonusesCost(token, request);
                setSuccessMsg(`Created: ${response.AmountForOneBonus} ${response.Currency} per bonus`);
            }
        } catch (err) {
            console.error('❌ Bonuses cost error:', err);
            setError(err.response?.data?.message || 'Something went wrong.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalWrapper>
            <FormContainer as="form" onSubmit={handleSubmit}>
                <h2 style={{ color: '#388e3c' }}>
                    {isEditMode ? 'Edit Bonus Cost' : 'Create Bonus Cost'}
                </h2>

                <Label>Currency:</Label>
                <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={{
                        padding: '12px',
                        border: '1px solid #c8e6c9',
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: '#fff',
                        color: '#2e7d32'
                    }}
                >
                    <option value="">Select currency</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="UAH">UAH</option>
                </select>

                <Label>Amount for One Bonus:</Label>
                <Input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : isEditMode ? 'Update' : 'Create'}
                </Button>

                {error && <ErrorMessage>{error}</ErrorMessage>}
                {successMsg && <SuccessMessage>{successMsg}</SuccessMessage>}
            </FormContainer>
        </ModalWrapper>
    );
}
