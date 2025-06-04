import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import UserProfile from './components/auth/UserProfile';
import Dashboard from './components/core/Dashboard';
import GroupList from './components/core/GroupList'; 
import GroupCreation from './components/core/GroupCreation';
import GroupDetail from './components/core/GroupDetail';
import ExpenseForm from './components/core/ExpenseForm'; 
import ExpenseList from './components/core/ExpenseList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/groups" element={<GroupList />} />
        <Route path="/create-group" element={<GroupCreation />} />
        <Route path="/group" element={<GroupDetail />} />
        <Route path="/add-expense" element={<ExpenseForm />} />
        <Route path="/expense-list" element={<ExpenseList />} />

      </Routes>
    </Router>
  );
}

export default App;
