import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { DataProvider } from './context/DataContext.jsx';
import Login from "../src/Components/Login.jsx";
import Orders from "./Components/Orders.jsx";

function App() {
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (role) => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  return (
    <DataProvider>
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

            {/* Dashboard route */}
            

            {/* Orders Route */}
            <Route
              path="/orders"
              element={
                userRole ? <Orders userRole={userRole} /> : <Navigate to="/" />
              }
              />
              
          </Routes>

        </main>
      </Router>
    </DataProvider>
  )
}

export default App
