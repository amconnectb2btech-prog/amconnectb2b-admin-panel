import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import DashboardLayout from './components/layout/DashboardLayout.jsx'
import LoadingScreen from './components/ui/LoadingScreen.jsx'

const Login = lazy(() => import('./pages/Login.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const ContactSubmissions = lazy(() => import('./pages/ContactSubmissions.jsx'))
const CustomServices = lazy(() => import('./pages/CustomServices.jsx'))
const CustomServiceEdit = lazy(() => import('./pages/CustomServiceEdit.jsx'))
const Testimonials = lazy(() => import('./pages/Testimonials.jsx'))
const CaseStudiesAdmin = lazy(() => import('./pages/CaseStudiesAdmin.jsx'))
const AdminUsers = lazy(() => import('./pages/AdminUsers.jsx'))
const SiteContent = lazy(() => import('./pages/SiteContent.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Analytics = lazy(() => import('./pages/Analytics.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submissions" element={<ContactSubmissions />} />
          <Route path="/services" element={<CustomServices />} />
          <Route path="/services/new" element={<CustomServiceEdit />} />
          <Route path="/services/:id" element={<CustomServiceEdit />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/case-studies" element={<CaseStudiesAdmin />} />
          <Route path="/content" element={<SiteContent />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
