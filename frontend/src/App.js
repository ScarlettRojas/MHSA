import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
//session
import SessionsPage from './pages/SessionsPage';
//mood
import MoodsPage from './pages/MoodsPage';
//resoruces
import ResourcesPage from './pages/ResourcesPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/moods" element={<MoodsPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
