import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/api/auth/login', formData);
      login(res.data);
      navigate('/resources'); // o '/sessions'
    } catch {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-sky-200 border border-sky-300 rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border rounded px-3 py-2 bg-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full border rounded px-3 py-2 bg-white"
          />
          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 rounded"
          >
            Login
          </button>
        </form>

        <p className="text-xs text-slate-700 mt-3 text-center">
          Don’t have an account?{' '}
          <Link to="/register" className="underline text-sky-800">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
