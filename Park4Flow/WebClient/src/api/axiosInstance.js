import axios from "axios"

const BASE_URL = process.env.REACT_APP_BASE_URL
console.log(BASE_URL)

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 0,
    headers:{
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
    },
});

axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem("jwtToken");
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;