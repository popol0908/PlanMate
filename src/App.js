import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme/theme';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import Home from './pages/home/Home';
import Plans from './pages/plans/Plans';
import Progress from './pages/progress/Progress';
import Profile from './pages/profile/Profile';
import AboutUs from './pages/AboutUs';
import BottomNav from './components/common/BottomNav';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <PrivateRoute>
                <Home />
                <BottomNav />
              </PrivateRoute>
            } />
            
            <Route path="/plans" element={
              <PrivateRoute>
                <Plans />
                <BottomNav />
              </PrivateRoute>
            } />
            
            <Route path="/progress" element={
              <PrivateRoute>
                <Progress />
                <BottomNav />
              </PrivateRoute>
            } />
            
            <Route path="/about" element={
              <PrivateRoute>
                <AboutUs />
                <BottomNav />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
                <BottomNav />
              </PrivateRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;