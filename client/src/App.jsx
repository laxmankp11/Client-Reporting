import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebsiteProvider } from './context/WebsiteContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminClients from './pages/AdminClients';
import AdminDevelopers from './pages/AdminDevelopers';
import AdminWebsites from './pages/AdminWebsites';
import WorkLogs from './pages/WorkLogs';
import Layout from './components/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <WebsiteProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><AdminClients /></ProtectedRoute>} />
          <Route path="/developers" element={<ProtectedRoute><AdminDevelopers /></ProtectedRoute>} />
          <Route path="/websites" element={<ProtectedRoute><AdminWebsites /></ProtectedRoute>} />
          <Route path="/worklogs" element={<ProtectedRoute><WorkLogs /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </WebsiteProvider>
    </AuthProvider>
  );
};

export default App;
