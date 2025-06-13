import React, { useState } from "react";
import styled from "styled-components";
import { Eye, EyeOff } from "lucide-react";

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

const ToggleIcon = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: #999;
  z-index: 2;
`;

export function PasswordInput({ placeholder, name, value, onChange }) {
    const [visible, setVisible] = useState(false);
    return (
        <InputWrapper>
            <StyledInput
                type={visible ? "text" : "password"}
                placeholder={placeholder}
                name={name}
                value={value}
                onChange={onChange}
            />
            <ToggleIcon onClick={() => setVisible((v) => !v)}>
                {visible ? <EyeOff size={20} /> : <Eye size={20} />}
            </ToggleIcon>
        </InputWrapper>
    );
}