import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import AdminPage from './pages/AdminPage';
import AdminMenuPage from './pages/AdminMenuPage';
import AdminUpdateMenuPage from './pages/AdminUpdatePage';
import AdminLogin from './pages/AdminLogin';
import PrivateRoute from './pages/ProtectedRoute';
import CallbackPage from './pages/PaymentVerificationPage';
 // Update the import if needed
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress'; // Loading indicator
import Box from '@mui/material/Box'; // For layout
import CafeHomepage from './pages/Sidebar';

function App() {
  const [menus, setMenus] = useState([]);
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch menus on component mount
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await axios.get("https://food-server-seven.vercel.app/api/menu");
        setMenus(response.data);
        // Extract unique cafes from the menus data
        const uniqueCafes = Array.from(new Set(response.data.map(menu => menu.cafe)));
        setCafes(uniqueCafes.map(cafe => ({ name: cafe }))); // Set cafes with their names
        setLoading(false);
      } catch (error) {
        console.error("Error fetching menus:", error);
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    ); // Show loading spinner while fetching data
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<CafeHomepage cafes={cafes} onCafeSelect={() => {}} />} />
        <Route path="/:cafeName" element={<MenuPage menus={menus} />} />
        <Route path="/payment/callback" element={<CallbackPage />} />
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
