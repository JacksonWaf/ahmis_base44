import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from './components/layout/AppLayout';
import { FacilityProvider } from './lib/FacilityContext';
import Dashboard from './pages/Dashboard';
import Facilities from './pages/Facilities.jsx';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Laboratory from './pages/Laboratory';
import Imaging from './pages/Imaging';
import EquipmentPage from './pages/Equipment';
import Pharmacy from './pages/Pharmacy';
import Inventory from './pages/Inventory';
import Staff from './pages/Staff.jsx';
import Billing from './pages/Billing';
import OPD from './pages/OPD';
import Analytics from './pages/Analytics';
import EMR from './pages/EMR';
import PatientPortal from './pages/PatientPortal';
import Inpatient from './pages/Inpatient';
import UserManagement from './pages/UserManagement.jsx';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Dashboard" replace />} />
      <Route element={<AppLayout />}>
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Patients" element={<Patients />} />
        <Route path="/Appointments" element={<Appointments />} />
        <Route path="/Laboratory" element={<Laboratory />} />
        <Route path="/Imaging" element={<Imaging />} />
        <Route path="/Equipment" element={<EquipmentPage />} />
        <Route path="/Pharmacy" element={<Pharmacy />} />
        <Route path="/Inventory" element={<Inventory />} />
        <Route path="/Staff" element={<Staff />} />
        <Route path="/Billing" element={<Billing />} />
        <Route path="/OPD" element={<OPD />} />
        <Route path="/Analytics" element={<Analytics />} />
        <Route path="/EMR" element={<EMR />} />
        <Route path="/PatientPortal" element={<PatientPortal />} />
        <Route path="/Inpatient" element={<Inpatient />} />
        <Route path="/UserManagement" element={<UserManagement />} />
        <Route path="/Facilities" element={<Facilities />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <FacilityProvider>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </FacilityProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App