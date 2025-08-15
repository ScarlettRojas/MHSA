import React, { useEffect, useState } from 'react';
import { fetchMoods, createMood, updateMood, deleteMood } from '../api/moods';

const MOODS = [
  { value: 'happy', label: 'Happy' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'sad', label: 'Sad' },
  { value: 'anxious', label: 'Anxious' },
  { value: 'stressed', label: 'Stressed' },
];

export default function MoodsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    date: '',
    mood: 'neutral',
    intensity: 3,
    notes: '',
  });

  const load = async () => {
    try {
      setLoading(true);
      setErr('');
      const { data } = await fetchMoods();
      setItems(data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'intensity' ? Number(value) : value }));
  };

  const clearForm = () => setForm({ date: '', mood: 'neutral', intensity: 3, notes: '' });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErr('');
      if (editingId) {
        await updateMood(editingId, form);
      } else {
        await createMood(form);
      }
      setEditingId(null);
      clearForm();
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (item) => {
    setEditingId(item._id);
    setForm({
      date: item.date ? item.date.substring(0, 16) : '',
      mood: item.mood ?? 'neutral',
      intensity: item.intensity ?? 3,
      notes: item.notes ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this mood?')) return;
    try {
      setLoading(true);
      setErr('');
      await deleteMood(id);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Mood Tracking</h2>
        {editingId && (
          <span className="text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded">
            Editing…{' '}
            <button
              className="underline ml-2"
              onClick={() => { setEditingId(null); clearForm(); }}
            >
              Cancel
            </button>
          </span>
        )}
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {err}
        </div>
      )}

      {/* Card: Form */}
      <div className="bg-white shadow rounded p-6">
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">Date &amp; Time</span>
            <input
              type="datetime-local"
              name="date"
              value={form.date}
              onChange={onChange}
              required
              className="border rounded px-3 py-2"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">Mood</span>
            <select
              name="mood"
              value={form.mood}
              onChange={onChange}
              className="border rounded px-3 py-2"
            >
              {MOODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">Intensity (1–5)</span>
            <input
              type="range"
              name="intensity"
              min="1"
              max="5"
              value={form.intensity}
              onChange={onChange}
              className="w-full"
            />
            <span className="text-sm text-gray-600 mt-1">Current: {form.intensity}</span>
          </label>

          <label className="flex flex-col md:col-span-2">
            <span className="text-sm font-medium mb-1">Notes</span>
            <textarea
              name="notes"
              rows={3}
              value={form.notes}
              onChange={onChange}
              className="border rounded px-3 py-2"
            />
          </label>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); clearForm(); }}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Card: Table */}
      <div className="bg-white shadow rounded">
        <div className="px-6 pt-6 text-sm text-gray-700">History</div>
        <div className="overflow-x-auto p-6">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-gray-600 bg-gray-50">
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Mood</th>
                <th className="px-3 py-2 font-medium">Intensity</th>
                <th className="px-3 py-2 font-medium">Notes</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-3 py-4 text-gray-500">
                    No moods yet.
                  </td>
                </tr>
              ) : (
                items.map((m) => (
                  <tr key={m._id} className="border-t">
                    <td className="px-3 py-2">
                      {m.date ? new Date(m.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                    </td>
                    <td className="px-3 py-2 capitalize">{m.mood}</td>
                    <td className="px-3 py-2">{m.intensity}</td>
                    <td className="px-3 py-2">{m.notes || '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button onClick={() => onEdit(m)} className="text-blue-600 hover:underline mr-3">Edit</button>
                      <button onClick={() => onDelete(m._id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
