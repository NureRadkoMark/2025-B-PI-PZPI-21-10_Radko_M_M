import React, { useContext, useState } from "react";
import {
    BoldLink,
    BoxContainer,
    FormContainer,
    Input,
    MutedLink,
    SubmitButton,
} from "./common";
import { Marginer } from "../marginer";
import {AccountContext, useAccount} from "./accountContext";
import { PasswordInput } from "../PasswordInput";
import { NotificationManager } from "react-notifications";
import { useNavigate } from "react-router-dom";
import {loginRequestModel} from "../../api/models/user/loginModels";
import apiService from "../../api/apiService";
import {getLocalizedString} from "../../locale/lang";
import {CustomInput} from "../CustomInput";

export function LoginForm() {

    const preferredLang = localStorage.getItem("language") || "en";
    const { switchToSignup } = useAccount();
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const click = async (e) => {
        console.log("Метод handleSubmit вызван");
        e.preventDefault();
        try {
            const requestModel = loginRequestModel(Email, Password);
            const loginResponseModel = await apiService.login(requestModel);
            const token = loginResponseModel.token;
            console.log(token)
            const userDetails = await apiService.getUserDetails(token);
            console.log(userDetails)

            localStorage.setItem("jwtToken", token);
            localStorage.setItem("Role", userDetails.Role);
            localStorage.setItem("Currency", userDetails.Currency);

            NotificationManager.success(getLocalizedString(preferredLang, "LoginSuccess"));

            setEmail("");
            setPassword("");
            window.location.href = '/home';
        } catch (err) {
            const errorMessage = err.message || "Login failed";
            setError(errorMessage);
            NotificationManager.error(getLocalizedString(preferredLang, errorMessage));
        }
    };

    return (
        <BoxContainer>
            <FormContainer onSubmit={click}
                           >
                <CustomInput
                    placeholder={getLocalizedString(preferredLang, "Email")}
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Marginer direction="vertical" margin="0.8em" />
                <PasswordInput
                    placeholder={getLocalizedString(preferredLang, "Password")}
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Marginer direction="vertical" margin="0.8em" />
                <BoldLink href="/pass-recovery">
                    {getLocalizedString(preferredLang, "ForgotPassword")}
                </BoldLink>
                <Marginer direction="vertical" margin="1.6em" />
                <SubmitButton type="submit">
                    {getLocalizedString(preferredLang, "SignIn")}
                </SubmitButton>
                <Marginer direction="vertical" margin="1em" />
                <MutedLink href="#">
                    {getLocalizedString(preferredLang, "NoAccount")}{" "}
                    <BoldLink
                        to="/register"
                        onClick={(e) => {
                            e.preventDefault();
                            switchToSignup();
                        }}
                    >
                        {getLocalizedString(preferredLang, "RegisterHere")}
                    </BoldLink>
                </MutedLink>
            </FormContainer>
        </BoxContainer>
    );
}