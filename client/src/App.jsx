import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminChatPage from './pages/AdminChatPage';
import PrivateAdminRoute from './components/PrivateAdminRoute';
import ChatButton from './components/chat/ChatButton';

export default function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/purchases" element={<Dashboard />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="/admin/dashboard"
        element={
          <PrivateAdminRoute>
            <AdminDashboard />
          </PrivateAdminRoute>
        }
      />
      <Route
        path="/admin/chat"
        element={
          <PrivateAdminRoute>
            <AdminChatPage />
          </PrivateAdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <ChatButton />
    </>
  );
}
