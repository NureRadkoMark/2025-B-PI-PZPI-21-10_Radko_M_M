import {createContext, useContext, useMemo, useState} from "react";

export const AccountContext = createContext({
    switchToSignup: () => {},
    switchToSignin: () => {}
});

// Хук для удобного использования
export const useAccount = () => {
    const context = useContext(AccountContext);
    if (!context) {
        throw new Error("useAccount must be used within AccountProvider");
    }
    return context;
};

// Провайдер контекста
export const AccountProvider = ({ children }) => {
    const [active, setActive] = useState("signin");

    const switchToSignup = () => setActive("signup");
    const switchToSignin = () => setActive("signin");

    const value = useMemo(() => ({
        active,
        switchToSignup,
        switchToSignin
    }), [active]);

    return (
        <AccountContext.Provider value={value}>
            {children}
        </AccountContext.Provider>
    );
};