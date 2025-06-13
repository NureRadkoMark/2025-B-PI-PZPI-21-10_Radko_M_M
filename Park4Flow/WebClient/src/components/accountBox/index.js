import React, {useEffect, useState} from "react";
import styled from "styled-components";
import { LoginForm } from "./loginForm";
import { motion, AnimatePresence } from "framer-motion";
import {AccountContext, useAccount} from "./accountContext";
import { SignupForm } from "./signupForm";
import {useLocation, useNavigate} from "react-router-dom";

const BoxContainer = styled.div`
  width: 280px;
  min-height: 550px;
  display: flex;
  flex-direction: column;
  border-radius: 19px;
  background-color: #fff;
  box-shadow: 0 0 2px rgba(15, 15, 15, 0.28);
  position: relative;
  overflow: hidden;
  transform: translateZ(0); // Фикс для аппаратного ускорения
  backface-visibility: hidden; // Предотвращение артефактов анимации
`;

const TopContainer = styled.div`
  width: 100%;
  height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 1.8em;
  padding-bottom: 5em;
`;

const BackDrop = styled(motion.div)`
  width: 160%;
  height: 550px;
  position: absolute;
  display: flex;
  flex-direction: column;
  border-radius: 50%;
  transform: rotate(60deg);
  top: -290px;
  left: -70px;
  background: rgb(56, 142, 60);
  background: linear-gradient(58deg,
  rgb(56, 142, 60) 20%,
  rgb(56, 142, 60) 100%);
  z-index: 0;
  backface-visibility: hidden;
  will-change: transform;
`;

const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const AppContainer = styled.div`
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      perspective: 1000px; // Для лучшей работы 3D-трансформаций
      transform-style: preserve-3d;
    `;

const HeaderText = styled.h2`
  font-size: 30px;
  font-weight: 600;
  line-height: 1.24;
  color: #fff;
  z-index: 10;
  margin: 0;
`;

const SmallText = styled.h5`
  color: #fff;
  font-weight: 500;
  font-size: 11px;
  z-index: 10;
  margin: 0;
  margin-top: 7px;
`;

const InnerContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 1.8em;
`;

const expandingTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 1.5,
};

const backdropVariants = {
    expanded: {
        width: "1600px",
        height: "1600px",
        borderRadius: "20%",
        rotate: 60,
        transition: {
            ...expandingTransition,
            ease: "anticipate" // Более плавное завершение анимации
        }
    },
    collapsed: {
        width: "160%",
        height: "550px",
        borderRadius: "50%",
        rotate: 60,
        transition: {
            ...expandingTransition,
            ease: "backInOut" // Плавный вход в начальное состояние
        }
    }
};


export function AccountBox(props) {
    const { switchToSignup, switchToSignin } = useAccount();
    const location = useLocation();
    const [isExpanded, setExpanded] = useState(false);
    const initialActive = location.pathname === "/login" ? "signin" : "signup";
    const [active, setActive] = useState(initialActive);
    const pathname = location.pathname;
    const navigate = useNavigate();

    const playExpandingAnimation = (newActive) => {
        setExpanded(true);
        setTimeout(() => {
            setExpanded(false);
            setActive(newActive);
            navigate(newActive === "signin" ? "/login" : "/register");
        }, expandingTransition.duration * 1000);
    };

    useEffect(() => {
        if (location.pathname === "/register" && active !== "signup") {
            playExpandingAnimation("signup");
        } else if (location.pathname === "/login" && active !== "signin") {
            playExpandingAnimation("signin");
        }
    }, [location.pathname]);

    const contextValue = {
        switchToSignup: () => playExpandingAnimation("signup"),
        switchToSignin: () => playExpandingAnimation("signin")
    };

    return (
        <AccountContext.Provider value={contextValue}>
            <AppContainer>
                <BoxContainer>
                    <TopContainer>
                        <BackDrop
                            initial="collapsed"
                            animate={isExpanded ? "expanded" : "collapsed"}
                            variants={backdropVariants}
                            transition={expandingTransition}
                        />
                        <HeaderContainer>
                            {active === "signin" && (
                                <>
                                    <HeaderText>Welcome</HeaderText>
                                    <HeaderText>Back</HeaderText>
                                    <SmallText>Please sign-in to continue!</SmallText>
                                </>
                            )}
                            {active === "signup" && (
                                <>
                                    <HeaderText>Create</HeaderText>
                                    <HeaderText>Account</HeaderText>
                                    <SmallText>Please sign-up to continue!</SmallText>
                                </>
                            )}
                        </HeaderContainer>
                    </TopContainer>
                    <InnerContainer>
                        <AnimatePresence mode='wait'>
                            {!isExpanded && (
                                <motion.div
                                    key={active}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: 0.1,
                                        type: "spring"
                                    }}
                                    style={{
                                        pointerEvents: isExpanded ? "none" : "auto",
                                        position: "relative", // Добавляем
                                        zIndex: 2 // Устанавливаем выше бэкдропа
                                    }}
                                >
                                    {active === "signin" && <LoginForm />}
                                    {active === "signup" && <SignupForm />}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </InnerContainer>
                </BoxContainer>
            </AppContainer>
        </AccountContext.Provider>
    );
}
