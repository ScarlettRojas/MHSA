// frontend/src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import PastelCard from '../components/PastelCard';

export default function Profile() {
  const { user } = useAuth(); // token viene de context
  const token = user?.token;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  // Cargar perfil
  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({
          name: data.name || '',
          email: data.email || '',
          university: data.university || '',
          address: data.address || '',
        });
      } catch (error) {
        console.error(error);
        alert('Failed to fetch profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Cambios de inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Actualizar perfil
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      await axiosInstance.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Profile updated successfully.');
    } catch (error) {
      console.error(error);
      alert('Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <PastelCard className="p-6">
        <h1 className="text-2xl font-bold text-blue-900 text-center mb-5">
          Your Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-white"
            disabled={loading}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-white"
            // normalmente el email no se edita
            disabled
          />
          <input
            name="university"
            placeholder="University"
            value={formData.university}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-white"
            disabled={loading}
          />
          <input
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-white"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 rounded"
          >
            {loading ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </PastelCard>
    </div>
  );
}
