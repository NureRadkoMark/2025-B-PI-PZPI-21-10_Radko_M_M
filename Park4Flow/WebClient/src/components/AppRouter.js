import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { publicRoutes } from '../routes';
import JWT from "../functions/JWT";

const AppRouter = () => {
    return (
        <Routes>
            {publicRoutes.map(({path, Element}) => (
                <Route key={path} path={path} element={<Element />} />
            ))}
        </Routes>
    );
};

export default AppRouter;