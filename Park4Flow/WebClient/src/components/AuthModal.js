import { Routes, Route, useLocation } from "react-router-dom";
import { ModalWrapper } from "./ModalWrapper";
import { AccountBox } from "./accountBox";
import {AccountProvider} from "./accountBox/accountContext";

export const AuthModal = () => {
    const location = useLocation();

    return (
        <AccountProvider>
            <Routes location={location} key={location.pathname}>
                <Route
                    path="/login"
                    element={
                        <ModalWrapper>
                            <AccountBox initialActive="signin" />
                        </ModalWrapper>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <ModalWrapper>
                            <AccountBox initialActive="signup" />
                        </ModalWrapper>
                    }
                />
            </Routes>
        </AccountProvider>
    );
};