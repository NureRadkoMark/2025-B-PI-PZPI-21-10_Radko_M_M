import styled from "styled-components";

export const BoxContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
`;

export const FormContainer = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 0px 2.5px rgba(15, 15, 15, 0.19);
  position: relative;
  z-index: 1;
`;

export const MutedLink = styled.span`
  font-size: 11px;
  color: rgba(200, 200, 200, 0.8);
  font-weight: 500;
  text-decoration: none;
`;

export const BoldLink = styled.a`
  font-size: 11px;
  color: rgb(64, 243, 10);
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  margin: 0 4px;
  position: relative;
  z-index: 1001;
`;

export const Input = styled.input`
  width: 100%;
  height: 42px;
  padding: 0px 10px;
  border: 1px solid rgba(200, 200, 200, 0.3);
  border-radius: 20px;
  font-size: 12px;
  transition: all 200ms ease-in-out;

  &::placeholder {
    color: rgba(200, 200, 200, 1);
  }

  &:focus {
    outline: none;
    border: 2px solid rgb(64, 243, 10);
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 11px 40%;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  border: none;
  position: relative;
  z-index: 1001;
  border-radius: 100px 100px 100px 100px;
  cursor: pointer;
  transition: all, 240ms ease-in-out;
  background: rgb(56, 142, 60);
  background: linear-gradient(58deg,
  rgb(56, 142, 60) 20%,
  rgb(56, 142, 60) 100%);

  &:hover {
    filter: brightness(1.03);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;