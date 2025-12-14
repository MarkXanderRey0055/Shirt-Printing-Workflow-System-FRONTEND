import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from "../src/Components/Login.jsx";

function App() {
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (role) => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  return (
    <Router>
      <main className="bg-[#E0D9D9] min-h-screen">
        {userRole && <Navbar userRole={userRole} onLogout={handleLogout} />}

        <Routes>
          {/* Login Route */}
          <Route
            path="/"
            element={
              userRole ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
            }
          
          />

        </Routes>

      </main>
    </Router>
  )
}

export default App
