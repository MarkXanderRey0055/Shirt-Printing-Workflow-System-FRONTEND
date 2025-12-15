import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { DataProvider } from './context/DataContext.jsx';
import Login from "../src/Components/Login.jsx";
import Orders from "./Components/Orders.jsx";
import Navbar from "../src/Components/Navbar.jsx";
import Inventory from "../src/Components/Navbar.jsx";
import Reports from "../src/Components/Reports.jsx";

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
            <Route
              path="/dashboard"
              element={
                userRole ? <Dashboard userRole={userRole} /> : <Navigate to="/" />
              }
              />


            {/* Orders Route */}
            <Route
              path="/orders"
              element={
                userRole ? <Orders userRole={userRole} /> : <Navigate to="/" />
              }
              />

              {/* Inventory Route */}
              <Route
                path="/inventory"
                element={
                  userRole ? <Inventory userRole={userRole} /> : <Navigate to="/" />
                }
              />

              {/* Reports Route */}
              <Route
                path="/reports"
                element={
                  userRole ? <Reports userRole={userRole} /> : <Navigate to="/" />
                }
              />
              
          </Routes>

        </main>
      </Router>
    </DataProvider>
  )
}

export default App
