import { Routes, Route, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/BookAppointment';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import images
import homeBg from './home.jpg';
import insideBg from './inside.png';

// Placeholder Home
const Home = () => (
  <div
    className="flex flex-col items-center justify-center min-h-[85vh] text-center space-y-6 bg-cover-center rounded-xl shadow-2xl p-8"
    style={{ backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url(${homeBg})` }}
  >
    <h1 className="text-6xl font-extrabold text-primary tracking-tight drop-shadow-sm">Welcome to MedConnect</h1>
    <p className="text-2xl text-slate-700 max-w-2xl font-light">Book appointments with professional specialists from all over the world. Your health, perfectly managed.</p>
    <div className="pt-4">
      <a href="/login" className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-10 rounded-full shadow-xl transition-all hover:scale-105 inline-block text-lg">Book an Appointment</a>
    </div>
  </div>
);

const App = () => {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div
      className={`min-h-screen flex flex-col transition-all duration-500 ${!isHome ? 'bg-cover-center' : 'bg-slate-50'}`}
      style={!isHome ? { backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.3), rgba(248, 250, 252, 0.2)), url(${insideBg})`, } : {}}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/book-appointment/:id" element={<BookAppointment />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
