import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

function EventListPage() {
  const navigate = useNavigate();

  // INPUT (yang diketik user)
  const [searchInput, setSearchInput] = useState("");

  // QUERY (yang benar-benar dipakai fetch)
  const [searchQuery, setSearchQuery] = useState("");

  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH EVENTS ================= */
  useEffect(() => {
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

        if (json.success) setEvents(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [searchQuery, city, category]);

  /* ================= SEARCH BUTTON ================= */
  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-cyan-50">

      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white py-16 overflow-hidden">

        {/* GLOW */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-400 blur-[120px] opacity-30" />
        <div className="absolute top-10 right-0 w-96 h-96 bg-cyan-400 blur-[120px] opacity-30" />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <span className="inline-block mb-4 px-5 py-2 rounded-full bg-white/20 text-xs font-bold tracking-widest">
            LIVE EVENT PLATFORM
          </span>

          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Temukan Konser{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-white">
              Impianmu 🎤
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-white/90 mb-10">
            Jelajahi konser, festival, dan pertunjukan terbaik di kotamu
          </p>

          {/* ================= SEARCH BOX ================= */}
          <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-xl rounded-[36px] shadow-[0_40px_100px_rgba(0,0,0,0.25)] px-8 py-8">

            {/* INPUT */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Cari konser, artis, atau festival impianmu..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="
                  w-full px-8 py-5 rounded-full
                  text-lg font-medium text-gray-800
                  bg-gray-100 placeholder-gray-400

                  border-2 border-pink-300
                  ring-2 ring-pink-300/40

                  focus:outline-none
                  focus:ring-4 focus:ring-pink-400/60
                  focus:border-pink-400

                  transition-all duration-300
                "
              />

              <button
                onClick={handleSearch}
                className="
                  absolute right-2 top-1/2 -translate-y-1/2
                  px-7 py-3 rounded-full
                  bg-gradient-to-r from-pink-500 to-cyan-500
                  text-white font-bold
                  hover:scale-105 active:scale-95
                  transition
                "
              >
                🔍 Cari
              </button>
            </div>

            {/* FILTER */}
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-6 py-3 rounded-full bg-pink-50 text-pink-700 font-semibold border border-pink-200"
              >
                <option value="">📍 Semua Kota</option>
                <option value="Jakarta">Jakarta</option>
                <option value="Bandung">Bandung</option>
                <option value="Surabaya">Surabaya</option>
              </select>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-6 py-3 rounded-full bg-cyan-50 text-cyan-700 font-semibold border border-cyan-200"
              >
                <option value="">🎭 Semua Kategori</option>
                <option value="Music Festival">🎶 Music Festival</option>
                <option value="Conference">🎤 Conference</option>
                <option value="Comedy Show">😂 Comedy Show</option>
              </select>

              <span className="ml-auto px-5 py-3 rounded-full bg-pink-100 text-pink-600 font-bold animate-pulse">
                🔥 Trending minggu ini
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= EVENT LIST ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-10">
          Event Terpopuler 🎶
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading event...</p>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-500">Tidak ada event 😢</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="cursor-pointer group"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="h-72 w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  <span className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold">
                    LIVE EVENT
                  </span>

                  <div className="absolute bottom-0 p-6 text-white">
                    <h3 className="text-xl font-bold">{event.title}</h3>
                    <p className="text-sm opacity-80">📍 {event.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default EventListPage;
