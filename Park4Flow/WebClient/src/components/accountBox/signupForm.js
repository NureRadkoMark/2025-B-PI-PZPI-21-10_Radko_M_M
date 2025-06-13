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
import styled from "styled-components";
import apiService from "../../api/apiService";
import {registerRequestModel} from "../../api/models/user/registerModels";
import {CustomInput} from "../CustomInput";
import {getLocalizedString} from "../../locale/lang";

// Обёртка для фиксированной высоты и внутреннего скролла
const ScrollableForm = styled.div`
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
  padding-right: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1; // Добавлено
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #aaa;
  outline: none;
`;

export function SignupForm() {
    const { switchToSignin } = useAccount();
    const preferredLang = localStorage.getItem("language") || "en";

    const [form, setForm] = useState({
        Email: "",
        Password: "",
        ConfirmPassword: "",
        FirstName: "",
        SecondName: "",
        PhoneNumber: "",
        Currency: "USD",
    });

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        console.log("Метод handleSubmit вызван");
        e.preventDefault();

        if (form.Password !== form.ConfirmPassword) {
            NotificationManager.error("Passwords do not match");
            return;
        }

        try {
            console.log("Форма перед отправкой:", form);
            const request = registerRequestModel(
                form.Email,
                form.Password,
                form.FirstName,
                form.SecondName,
                form.PhoneNumber,
                form.Currency
            );
            console.log(registerRequestModel);
            console.log("Запрос на сервер:", request);
            const response = await apiService.register(request);

            console.log("Ответ сервера:", response);
            setForm({
                email: "",
                password: "",
                confirmPassword: "",
                firstName: "",
                secondName: "",
                phoneNumber: "",
                currency: "USD",
            });
            NotificationManager.success(response.Message);
            switchToSignin();
        } catch (err) {
            console.log("Ошибка:", err);
            NotificationManager.error(err.message || "Registration failed");
        }
    };

    return (
        <BoxContainer>
            <FormContainer onSubmit={handleSubmit}>
                <ScrollableForm>
                    <CustomInput
                        placeholder="First Name"
                        name="FirstName"
                        value={form.FirstName}
                        onChange={handleChange}
                    />
                    <CustomInput
                        placeholder="Second Name"
                        name="SecondName"
                        value={form.SecondName}
                        onChange={handleChange}
                    />
                    <CustomInput
                        placeholder="Email"
                        name="Email"
                        value={form.Email}
                        onChange={handleChange}
                    />
                    <PasswordInput
                        placeholder="Password"
                        name="Password"
                        value={form.Password}
                        onChange={handleChange}
                    />
                    <PasswordInput
                        placeholder="Confirm Password"
                        name="ConfirmPassword"
                        value={form.ConfirmPassword}
                        onChange={handleChange}
                    />
                    <CustomInput
                        placeholder="Phone Number"
                        name="PhoneNumber"
                        value={form.PhoneNumber}
                        onChange={handleChange}
                    />
                    <Select
                        name="Currency"
                        value={form.Currency}
                        onChange={handleChange}
                    >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="RUB">RUB</option>
                        <option value="KZT">KZT</option>
                        <option value="UAH">UAH</option>
                    </Select>
                </ScrollableForm>
                <Marginer direction="vertical" margin="1em" />
                <SubmitButton type="submit">Signup</SubmitButton>
                <Marginer direction="vertical" margin="0.5em" />
                <MutedLink href="#">
                    Already have an account?{" "}
                    <BoldLink
                        to="/login"
                        onClick={(e) => {
                            e.preventDefault();
                            switchToSignin();
                        }}
                    >
                        {getLocalizedString(preferredLang, "Signin")}
                    </BoldLink>
                </MutedLink>
            </FormContainer>
        </BoxContainer>
    );
}
