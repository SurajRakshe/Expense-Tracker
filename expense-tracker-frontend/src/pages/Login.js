import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { toast } from 'react-toastify';

const bgImages = ['/images/bg1.jpg', '/images/bg2.jpg', '/images/bg3.jpg'];
export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const navigate = useNavigate();

 // const bgImages = ['/images/bg1.jpg', '/images/bg2.jpg', '/images/bg3.jpg'];

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await API.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const inputIcon = (field) => {
    const value = form[field];
    if (!value) return '';
    if (field === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '✅' : '⚠️';
    }
    return value.length >= 6 ? '✅' : '⚠️';
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
        darkMode ? 'bg-black text-white' : 'bg-gray-100 text-black'
      }`}
      style={{
        backgroundImage: `url(${bgImages[bgIndex]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="bg-white text-black px-3 py-1 rounded shadow hover:bg-gray-200"
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <div className="w-full max-w-md p-8 bg-white/90 dark:bg-black/90 rounded-xl shadow-xl backdrop-blur-md z-10">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-600 dark:text-blue-300">
          Welcome Back
        </h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 pl-4 pr-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              required
            />
            <span className="absolute top-3 right-3">{inputIcon('email')}</span>
          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 pl-4 pr-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              required
            />
            <span className="absolute top-3 right-3">{inputIcon('password')}</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition transform hover:scale-105"
          >
            🔐 Login
          </button>
        </form>

        <p className="mt-6 text-sm text-center">
          Don’t have an account?{' '}
          <Link
            to="/register"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
