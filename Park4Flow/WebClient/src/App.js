import { BrowserRouter } from "react-router-dom";
import NavBar from "./components/NavBar";
import AppRouter from "./components/AppRouter";
import Footer from "./components/Footer";
import "./styles/App.css";
import {AuthModal} from "./components/AuthModal";
import refreshToken from "./functions/JWT";
import {useEffect} from "react";

function App() {
    useEffect(() => {
        refreshToken();
    }, []);
    return (
        <BrowserRouter>
            <NavBar />
            <AppRouter />
        </BrowserRouter>
    );
}

export default App;
