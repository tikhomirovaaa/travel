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
import { useMemo, useState } from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Проверяем сохраненную тему в localStorage или используем светлую по умолчанию
    return localStorage.getItem('darkMode') === 'true';
  });

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90caf9' : '#1e3a8a',
      },
      secondary: {
        main: darkMode ? '#f48fb1' : '#3b82f6',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
  }), [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
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

export default App;