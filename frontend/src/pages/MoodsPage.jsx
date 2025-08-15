import React, { useEffect, useState, useMemo } from 'react';
import { fetchMoods, createMood, updateMood, deleteMood } from '../api/moods';
import PastelCard from '../components/PastelCard';

const MOODS = [
  { value: 'happy', label: 'Happy' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'sad', label: 'Sad' },
  { value: 'anxious', label: 'Anxious' },
  { value: 'stressed', label: 'Stressed' },
];

// YYYY-MM-DDTHH:mm in local time
const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function MoodsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [editingId, setEditingId] = useState(null);

  // sort by date: newest first by default
  const [dateSort, setDateSort] = useState('desc'); // 'asc' | 'desc'

  const [form, setForm] = useState({
    date: nowLocal(),   // default: now (no "Now" button)
    mood: 'neutral',    // enum (lowercase to match backend)
    intensity: 3,       // 1..5 (radio)
    notes: '',
    moodDetail: '',     // extra free-text appended into notes
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
    setForm((f) => ({
      ...f,
      [name]: name === 'intensity' ? Number(value) : value,
    }));
  };

  const clearForm = () =>
    setForm({
      date: nowLocal(),
      mood: 'neutral',
      intensity: 3,
      notes: '',
      moodDetail: '',
    });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErr('');

      // append optional free-text into notes (doesn't break enum)
      const combinedNotes = form.moodDetail
        ? (form.notes ? `${form.notes} | ${form.moodDetail}` : form.moodDetail)
        : form.notes;

      const payload = {
        date: form.date,
        mood: form.mood,               // enum (lowercase)
        intensity: form.intensity,
        notes: combinedNotes,
      };

      if (editingId) {
        await updateMood(editingId, payload);
      } else {
        await createMood(payload);
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
      date: item.date ? item.date.substring(0, 16) : nowLocal(),
      mood: item.mood ?? 'neutral',      // backend returns lowercase
      intensity: item.intensity ?? 3,
      notes: item.notes ?? '',
      moodDetail: '',                    // leave empty; user can add more
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

  // Sort by date according to dateSort
  const sortedItems = useMemo(() => {
    const arr = [...items];
    arr.sort((a, b) => {
      const ta = a?.date ? new Date(a.date).getTime() : 0;
      const tb = b?.date ? new Date(b.date).getTime() : 0;
      return dateSort === 'asc' ? ta - tb : tb - ta;
    });
    return arr;
  }, [items, dateSort]);

  const toggleDateSort = () => setDateSort((s) => (s === 'asc' ? 'desc' : 'asc'));

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-blue-900">Mood Tracking</h2>
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

      {/* Pastel card: Form */}
      <PastelCard className="p-6">
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date & Time */}
          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">Date &amp; Time</span>
            <input
              type="datetime-local"
              name="date"
              value={form.date}
              onChange={onChange}
              required
              className="border rounded px-3 py-2 bg-white"
            />
          </label>

          {/* Mood (enum select) */}
          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">Mood</span>
            <select
              name="mood"
              value={form.mood}
              onChange={onChange}
              className="border rounded px-3 py-2 bg-white"
            >
              {MOODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          {/* Intensity radios */}
          <div className="md:col-span-2">
            <span className="text-sm font-medium">Intensity (1–5)</span>
            <div className="mt-2 flex gap-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="intensity"
                    value={n}
                    checked={form.intensity === n}
                    onChange={onChange}
                    className="accent-blue-600"
                  />
                  <span>{n}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional mood text (goes into notes) */}
          <label className="flex flex-col md:col-span-2">
            <span className="text-sm font-medium mb-1">Additional mood (text)</span>
            <input
              type="text"
              name="moodDetail"
              value={form.moodDetail}
              onChange={onChange}
              placeholder="Type any mood in your own words (optional)"
              className="border rounded px-3 py-2 bg-white"
            />
          </label>

          {/* Notes */}
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
      </PastelCard>

      {/* Pastel card: History (darker + sortable by date) */}
      <PastelCard>
        <div className="px-6 pt-6 text-sm text-blue-900 font-medium">History</div>
        <div className="overflow-x-auto p-6">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-blue-900 bg-sky-200">
                <th className="px-3 py-2 font-medium">
                  <button
                    onClick={toggleDateSort}
                    className="flex items-center gap-1 hover:underline"
                    type="button"
                    aria-label="Sort by date"
                    title="Sort by date"
                  >
                    Date
                    <span>{dateSort === 'asc' ? '▲' : '▼'}</span>
                  </button>
                </th>
                <th className="px-3 py-2 font-medium">Mood</th>
                <th className="px-3 py-2 font-medium">Intensity</th>
                <th className="px-3 py-2 font-medium">Notes</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-3 py-4 text-gray-700">
                    No moods yet.
                  </td>
                </tr>
              ) : (
                sortedItems.map((m, idx) => (
                  <tr
                    key={m._id}
                    className={`border-t ${idx % 2 ? 'bg-sky-200/60' : 'bg-sky-100'} hover:bg-sky-300/60`}
                  >
                    <td className="px-3 py-2">
                      {m.date
                        ? new Date(m.date).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '-'}
                    </td>
                    <td className="px-3 py-2 capitalize">{m.mood}</td>
                    <td className="px-3 py-2">{m.intensity}</td>
                    <td className="px-3 py-2">{m.notes || '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button onClick={() => onEdit(m)} className="text-blue-700 hover:underline mr-3">
                        Edit
                      </button>
                      <button onClick={() => onDelete(m._id)} className="text-red-600 hover:underline">
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
