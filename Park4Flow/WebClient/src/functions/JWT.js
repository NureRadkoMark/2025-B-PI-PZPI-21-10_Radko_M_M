import apiService from "../api/apiService";

export default async function refreshToken() {
    const storedToken = localStorage.getItem('jwtToken');

    if (!storedToken || storedToken === "undefined") {
        return handleLogout();
    }

    try {
        const { token } = await apiService.checkAuth(storedToken);

        if (!token || typeof token !== 'string') {
            console.warn('Invalid token format:', token);
            return handleLogout();
        }

        localStorage.setItem('jwtToken', token);
    } catch (error) {
        console.error('Token refresh error:', error);
        return handleLogout();
    }
}

function handleLogout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('Role');
    if (window.location.pathname !== '/home') {
        window.location.href = '/home';
    }
}