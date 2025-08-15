import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import mockResources from '../mocks/resources';

// Helpers para sacar miniaturas
const getYouTubeId = (url) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    if (u.hostname === 'youtu.be') return u.pathname.slice(1);
  } catch (_) {}
  return null;
};

const getThumb = (r) => {
  // Si el recurso trae una imagen explícita, úsala
  if (r.image) return r.image;

  if (r.category === 'video') {
    const id = getYouTubeId(r.url);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    return 'https://placehold.co/640x360?text=Video';
  }
  if (r.category === 'pdf') return 'https://placehold.co/640x360?text=PDF';
  if (r.category === 'article') return 'https://placehold.co/640x360?text=Article';
  return 'https://placehold.co/640x360?text=Resource';
};

export default function ResourcesPage() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');

  const categories = useMemo(() => {
    const set = new Set(mockResources.map(r => r.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    return mockResources.filter(r => {
      const matchCat = cat === 'all' || r.category === cat;
      const text = `${r.title} ${r.description} ${r.category}`.toLowerCase();
      const matchQ = !q || text.includes(q.toLowerCase());
      return matchCat && matchQ;
    });
  }, [q, cat]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
          You must be logged in to view resources.{' '}
          <Link to="/login" className="text-blue-600 underline">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Mental Health Resources (Mock)</h2>

      {/* Filters */}
      <div className="bg-white shadow rounded p-4 flex flex-col md:flex-row gap-3 md:items-center">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Search title, description, category…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="text-gray-500 col-span-full">No resources found.</div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="bg-white shadow rounded overflow-hidden">
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                title="Open resource"
                className="block"
              >
                <img
                  src={getThumb(r)}
                  alt={`${r.title} thumbnail`}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
              </a>

              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{r.title}</h3>
                    <div className="text-xs text-gray-500 capitalize">{r.category}</div>
                  </div>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Open
                  </a>
                </div>
                {r.description && (
                  <p className="text-sm text-gray-700 mt-2">{r.description}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
