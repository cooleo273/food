import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import AdminPage from './pages/AdminPage';
import AdminMenuPage from './pages/AdminMenuPage';
import AdminUpdateMenuPage from './pages/AdminUpdatePage';
import AdminLogin from './pages/AdminLogin';
import PrivateRoute from './pages/ProtectedRoute';
import PaymentVerificationPage from './pages/PaymentVerificationPage';
import CallbackPage from './pages/PaymentVerificationPage';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MenuPage />} />
        <Route path="/payment/callback " element={<CallbackPage/>} />
        <Route path="/admin-login" element={<AdminLogin />} />
        

        {/* Protected Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute>
              <Routes>
                <Route path="/" element={<AdminPage />} />
                <Route path="menu" element={<AdminMenuPage />} />
                <Route path="updatemenu" element={<AdminUpdateMenuPage />} />
              </Routes>
            </PrivateRoute>
          }
        />

        {/* Default redirect for unmatched routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
