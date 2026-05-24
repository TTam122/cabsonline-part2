import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Booking from './components/Booking';
import Admin from './components/Admin';
import StatusCheck from './components/StatusCheck';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/booking">Book a Taxi</Link> |{' '}
        <Link to="/status">Check Booking Status</Link> |{' '}
        <Link to="/admin">Admin</Link>
      </nav>

      <Routes>
        <Route path="/booking" element={<Booking />} />
        <Route path="/status" element={<StatusCheck />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<Booking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
