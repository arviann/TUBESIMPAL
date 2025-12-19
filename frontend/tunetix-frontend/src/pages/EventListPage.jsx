import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function EventListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      async function fetchEvents() {
        try {
          setLoading(true);
          const params = new URLSearchParams();

          if (searchQuery) params.append("search", searchQuery);
          if (city) params.append("city", city);
          if (category) params.append("category", category);

          const res = await fetch(
            `http://localhost:3000/events?${params.toString()}`
          );
          const json = await res.json();

          if (json.success) {
            setEvents(json.data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }

      fetchEvents();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, city, category]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-cyan-50">

      {/* HERO */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4">Temukan Konser Impianmu 🎤</h2>
          <p className="mb-8">Jangan lewatkan pengalaman musik terbaik!</p>

          <div className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari konser, artis, atau kota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl text-gray-800"
              />
              <span className="absolute right-6 top-4 text-2xl">🔍</span>
            </div>

            <div className="flex gap-4 mt-4">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-4 py-2 rounded-xl text-gray-700"
              >
                <option value="">Semua Kota</option>
                <option value="Jakarta">Jakarta</option>
                <option value="Bandung">Bandung</option>
                <option value="Surabaya">Surabaya</option>
              </select>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 rounded-xl text-gray-700"
              >
                <option value="">Semua Kategori</option>
                <option value="Music Festival">Music Festival</option>
                <option value="Conference">Conference</option>
                <option value="Comedy Show">Comedy Show</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* EVENTS */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {events.length === 0 ? (
          <p className="text-center text-gray-600">
            Tidak ada konser ditemukan
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="bg-white rounded-xl shadow hover:shadow-xl cursor-pointer"
              >
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="h-48 w-full object-cover rounded-t-xl"
                />
                <div className="p-4">
                  <h3 className="font-bold">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.city}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-gray-900 text-white py-6 text-center">
        © 2025 TuneTix
      </footer>
    </div>
  );
}

export default EventListPage;
