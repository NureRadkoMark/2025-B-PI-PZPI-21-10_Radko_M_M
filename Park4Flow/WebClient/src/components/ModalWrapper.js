import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export function ModalWrapper({ children, onClose }) {
    const navigate = useNavigate();
    const overlayRef = useRef();

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            navigate(-1);
        }
    };

    const handleClickOutside = (e) => {
        if (overlayRef.current === e.target) {
            handleClose();
        }
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    return (
        <Overlay ref={overlayRef}>
            <div onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </Overlay>
    );
}