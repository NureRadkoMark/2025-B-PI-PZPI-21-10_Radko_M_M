import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import apiService from "../api/apiService";
import {createSalesPoliciesRequestModel} from "../api/models/salesPolicies/createSalesPoliciesModels";
import {ModalWrapper} from "../components/ModalWrapper";

const FormContainer = styled.div`
  background: #f1f8e9;
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

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Button = styled.button`
  padding: 12px;
  background-color: #81c784;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #66bb6a;
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

export default function CreateSalesPolicyModal() {
    const token = localStorage.getItem('jwtToken');
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [isForEveryone, setIsForEveryone] = useState(false);
    const [salePercent, setSalePercent] = useState('');
    const [submissionError, setSubmissionError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        if (!isForEveryone && !email.trim()) {
            return 'Email is required unless the discount is for everyone';
        }
        if (!salePercent || isNaN(salePercent) || salePercent <= 0 || salePercent > 100) {
            return 'Enter a valid discount percentage (1-100)';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionError('');
        setSuccess(false);

        const validationError = validate();
        if (validationError) {
            setSubmissionError(validationError);
            return;
        }

        try {
            setIsSubmitting(true);
            const request = createSalesPoliciesRequestModel(
                isForEveryone ? null : email.trim(),
                isForEveryone,
                parseFloat(salePercent),
            );

            await apiService.createSalesPolicies(token, request);
            setSuccess(true);
        } catch (err) {
            console.error('❌ Sales policy error:', err);
            setSubmissionError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalWrapper>
            <FormContainer as="form" onSubmit={handleSubmit}>
                <h2 style={{ color: '#388e3c' }}>Create Sales Policy</h2>

                <CheckboxContainer>
                    <input
                        type="checkbox"
                        id="isForEveryone"
                        checked={isForEveryone}
                        onChange={(e) => setIsForEveryone(e.target.checked)}
                    />
                    <label htmlFor="isForEveryone">Make discount available to everyone</label>
                </CheckboxContainer>

                <Label>Email (only if individual):</Label>
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isForEveryone}
                    placeholder="user@example.com"
                />

                <Label>Sale Percent (%):</Label>
                <Input
                    type="number"
                    value={salePercent}
                    onChange={(e) => setSalePercent(e.target.value)}
                    placeholder="e.g. 10"
                    min="1"
                    max="100"
                />

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Create Policy'}
                </Button>

                {submissionError && <ErrorMessage>{submissionError}</ErrorMessage>}
                {success && <SuccessMessage>Sales policy created successfully!</SuccessMessage>}
            </FormContainer>
        </ModalWrapper>
    );
}
