import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TripDetails from './pages/TripDetails';
import Profile from './pages/Profile';
import Subscriptions from './pages/Subscriptions';
import WishList from './pages/WishList';
import { AuthProvider } from './context/AuthContext';
import { useState, useMemo } from 'react';

export default function App() {
  const [mode, setMode] = useState('light');

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1e3a8a' : '#3b82f6',
      },
      secondary: {
        main: mode === 'light' ? '#3b82f6' : '#60a5fa',
      },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#0f172a',
        paper: mode === 'light' ? '#ffffff' : '#1e293b',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#1e3a8a' : '#1e293b',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
          },
        },
      },
    },
  }), [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Header toggleColorMode={toggleColorMode} mode={mode} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/trips/:id" element={<TripDetails />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/wishlist" element={<WishList />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}