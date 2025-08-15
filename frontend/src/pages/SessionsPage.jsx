import React, { useEffect, useState } from 'react';
import { fetchSessions, createSession, updateSession, deleteSession } from '../api/sessions';
import PastelCard from '../components/PastelCard';

const DOCTORS = ['Dra. García', 'Dr. Pérez', 'Dr. López'];

// YYYY-MM-DDTHH:mm (local) para <input type="datetime-local">
const toLocalInputValue = (d = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

export default function SessionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    date: toLocalInputValue(),   // default: ahora
    durationMinutes: 60,
    type: '',
    notes: '',
    doctor: '',
  });

  // Orden del historial
  const [sortBy, setSortBy] = useState('date');   // 'date' | 'doctor'
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'

  const load = async () => {
    try {
      setLoading(true);
      setErr('');
      const { data } = await fetchSessions();
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
    setForm((f) => ({ ...f, [name]: value }));
  };

  const clearForm = () =>
    setForm({
      date: toLocalInputValue(),
      durationMinutes: 60,
      type: '',
      notes: '',
      doctor: '',
    });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErr('');

      // bloquear fechas pasadas
      const chosen = new Date(form.date);
      const now = new Date();
      if (chosen < now) {
        setErr('Please pick a date and time in the future.');
        setLoading(false);
        return;
      }

      const payload = { ...form };
      if (editingId) {
        await updateSession(editingId, payload);
      } else {
        await createSession(payload);
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
      date: item.date ? item.date.substring(0, 16) : toLocalInputValue(),
      durationMinutes: item.durationMinutes ?? 60,
      type: item.type ?? '',
      notes: item.notes ?? '',
      doctor: item.doctor ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      setLoading(true);
      setErr('');
      await deleteSession(id);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const pickRandomDoctor = () => {
    if (!DOCTORS.length) return;
    const rand = DOCTORS[Math.floor(Math.random() * DOCTORS.length)];
    setForm((f) => ({ ...f, doctor: rand }));
  };

  const sortedItems = [...items].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'date') {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      cmp = da - db;
    } else if (sortBy === 'doctor') {
      const da = (a.doctor || '').toLowerCase();
      const db = (b.doctor || '').toLowerCase();
      cmp = da.localeCompare(db);
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-blue-900">Session Booking</h2>
        {editingId && (
          <span className="text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded">
            Editing session…{' '}
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

      {/* Card pastel: Form */}
      <PastelCard className="p-6">
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">Date &amp; Time</span>
            <input
              type="datetime-local"
              name="date"
              value={form.date}
              onChange={onChange}
              required
              min={toLocalInputValue()}
              className="border rounded px-3 py-2 bg-white"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">Duration (minutes)</span>
            <input
              type="number"
              name="durationMinutes"
              min="15"
              max="240"
              value={form.durationMinutes}
              onChange={onChange}
              required
              className="border rounded px-3 py-2 bg-white"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">Type</span>
            <input
              type="text"
              name="type"
              placeholder="counselling / follow-up"
              value={form.type}
              onChange={onChange}
              className="border rounded px-3 py-2 bg-white"
            />
          </label>

          <div className="flex flex-col">
            <span className="text-sm font-medium mb-1">Doctor</span>
            <div className="flex gap-2">
              <select
                name="doctor"
                value={form.doctor}
                onChange={onChange}
                className="border rounded px-3 py-2 bg-white flex-1"
              >
                <option value="">— Select doctor —</option>
                {DOCTORS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={pickRandomDoctor}
                className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                title="Pick a random doctor"
              >
                Next available
              </button>
            </div>
          </div>

          <label className="flex flex-col md:col-span-2">
            <span className="text-sm font-medium mb-1">Notes</span>
            <textarea
              name="notes"
              rows={3}
              value={form.notes}
              onChange={onChange}
              className="border rounded px-3 py-2 bg-white"
            />
          </label>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              {editingId ? 'Update Session' : 'Create Session'}
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
      </PastelCard>

      {/* Card pastel: Table */}
      <PastelCard>
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="text-sm text-blue-900 font-medium">Create Session</div>

          {/* Controles de ordenamiento */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-900">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded px-2 py-1 bg-white"
            >
              <option value="date">Date</option>
              <option value="doctor">Doctor</option>
            </select>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
              className="border rounded px-2 py-1 bg-white"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto p-6">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-blue-900 bg-sky-100">
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Duration</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Doctor</th>
                <th className="px-3 py-2 font-medium">Notes</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 py-4 text-gray-600">
                    No sessions yet.
                  </td>
                </tr>
              ) : (
                sortedItems.map((s, idx) => (
                  <tr
                    key={s._id}
                    className={`border-t ${idx % 2 ? 'bg-sky-50' : 'bg-white'} hover:bg-sky-100`}
                  >
                    <td className="px-3 py-2">
                      {s.date
                        ? new Date(s.date).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '-'}
                    </td>
                    <td className="px-3 py-2">{s.durationMinutes} min</td>
                    <td className="px-3 py-2">{s.type || '-'}</td>
                    <td className="px-3 py-2">{s.doctor || '-'}</td>
                    <td className="px-3 py-2">{s.notes || '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button
                        onClick={() => onEdit(s)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(s._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PastelCard>
    </div>
  );
}

