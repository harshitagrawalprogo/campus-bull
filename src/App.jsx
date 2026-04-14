import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RankPredictor from './pages/RankPredictor'
import MockTests from './pages/MockTests'
import MockTestInterface from './pages/MockTestInterface'
import CollegePredictor from './pages/CollegePredictor'
import CounsellingGuide from './pages/CounsellingGuide'
import ExpertCounselling from './pages/ExpertCounselling'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth()

  if (loading) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (requireAdmin && user.role !== 'ADMIN') return <Navigate to="/" replace />
  
  return children
}

const AppRoutes = () => {
  const { user, loading } = useAuth()

  if (loading) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'white'}}>Loading...</div>

  return (
    <Routes>
      {/* Public / Auth Route */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      {/* Public App Routes (Dashboard visible without login) */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="rank-predictor" element={<RankPredictor />} />
        <Route path="mock-tests" element={<MockTests />} />
        <Route path="mock-test/:id" element={<MockTestInterface />} />
        <Route path="college-predictor" element={<CollegePredictor />} />
        <Route path="counselling-guide" element={<CounsellingGuide />} />
        <Route path="expert-counselling" element={<ExpertCounselling />} />
        <Route path="profile" element={<Profile />} />
        
        {/* Admin only route */}
        <Route path="admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
