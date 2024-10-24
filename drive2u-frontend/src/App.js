// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import DriverDashboard from './components/Dashboard/DriverDashboard';
import PassengerDashboard from './components/Dashboard/PassengerDashboard';
import CreateTrip from './components/Trips/CreateTrip';
import TripList from './components/Trips/TripList';
import Profile from './components/Profile/Profile';
import PrivateRoute from './utils/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/driver/dashboard" 
            element={
              <PrivateRoute>
                <DriverDashboard />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/passenger/dashboard" 
            element={
              <PrivateRoute>
                <PassengerDashboard />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/trips/create" 
            element={
              <PrivateRoute>
                <CreateTrip />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/trips" 
            element={
              <PrivateRoute>
                <TripList />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />

          {/* Agrega más rutas según sea necesario */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
