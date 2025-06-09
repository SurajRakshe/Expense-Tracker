import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api';
import { toast } from 'react-toastify';
import { CheckCircle, AlertCircle } from 'lucide-react';

const bgImages = ['/images/bg1.jpg', '/images/bg2.jpg', '/images/bg3.jpg'];

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setBgIndex((prev) => (prev + 1) % bgImages.length);
        setFade(true);
      }, 500);
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
      const response = await registerUser(form.email, form.username, form.password);
      console.log('✅ Registration response:', response);
      toast.success('Registration successful. Please login.');
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed';
      console.error('🔴 Registration error:', err);
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const inputIcon = (field) => {
    const value = form[field];
    if (!value) return null;

    if (field === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? <CheckCircle className="text-green-500 w-5 h-5" />
        : <AlertCircle className="text-yellow-500 w-5 h-5" />;
    }
    return value.length >= 3
      ? <CheckCircle className="text-green-500 w-5 h-5" />
      : <AlertCircle className="text-yellow-500 w-5 h-5" />;
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
        transition: 'opacity 0.5s ease-in-out, background-image 1s ease-in-out',
        opacity: fade ? 1 : 0.4,
      }}
    >
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="bg-white text-black px-3 py-1 rounded shadow hover:bg-gray-200 dark:bg-gray-700 dark:text-white"
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <div className="w-full max-w-md p-8 bg-white/90 dark:bg-black/90 rounded-xl shadow-xl backdrop-blur-md z-10">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-600 dark:text-blue-300">
          Create Your Account
        </h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              name="username"
              placeholder="Full Name"
              value={form.username}
              onChange={handleChange}
              className="w-full p-3 pl-4 pr-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              required
            />
            <span className="absolute top-3 right-3">{inputIcon('username')}</span>
          </div>

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
            🚀 Register
          </button>
        </form>

        <p className="mt-6 text-sm text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
