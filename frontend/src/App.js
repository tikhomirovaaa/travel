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

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a', // Темно-синий
    },
    secondary: {
      main: '#3b82f6', // Голубой
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header />
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
    </ThemeProvider>
  );
}

export default App;