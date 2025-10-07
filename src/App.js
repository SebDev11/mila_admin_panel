import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./pages/Layout";
import { Dashboard } from "./pages/Dashboard";
import { CampaignList } from "./pages/app/CampaignList";
import { CampaignDetail } from "./pages/app/CampaignDetail";
import { UserDetail } from "./pages/admin/UserDetail";
import UserList from "./pages/admin/UserList";
import PendingRegistrations from "./pages/admin/PendingRegistrations";
import { Billing } from "./pages/Billing";
import { RestrictionPage } from "./pages/RestrictionPage";
import AuthPage from "./pages/auth/AuthPage";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} 
      />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="campaigns" element={<CampaignList />} />
        <Route path="campaign/:id" element={<CampaignDetail />} />
        <Route path="users" element={<UserList />} />
        <Route path="user/:id" element={<UserDetail />} />
        <Route path="pending-registrations" element={<PendingRegistrations />} />
        <Route path="billing" element={<Billing />} />
        <Route path="restrictions" element={<RestrictionPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10B981',
                color: '#fff',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#EF4444',
                color: '#fff',
              },
            },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
