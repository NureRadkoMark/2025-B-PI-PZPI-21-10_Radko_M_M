import React, { useState } from "react";
import styled from "styled-components";

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  height: 42px;
  padding: 0 35px 0 10px;
  border: 1px solid rgba(200, 200, 200, 0.3);
  border-radius: 20px;
  font-size: 12px;
  z-index: 1;
  position: relative;

  &::placeholder {
    color: rgba(200, 200, 200, 1);
  }

  &:focus {
    outline: none;
    border: 2px solid rgb(64, 243, 10);
  }
`;

export function CustomInput({ placeholder, name, value, onChange }) {
    return (
        <InputWrapper>
            <StyledInput
                name={name}
                type="text"
                placeholder={placeholder}
                value={value}       // Добавлено
                onChange={onChange} // Добавлено
            />
        </InputWrapper>
    );
}