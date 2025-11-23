import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function EventListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Array gambar untuk tiap card
  const cardImages = [
    "public/images/gesrek.jpg",
    "public/images/edu.png",
    "public/images/suca.jpg"
  ];

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("http://localhost:3000/events");
        const json = await res.json();
        if (json.success) {
          setEvents(json.data);
        }
      } catch (err) {
        console.error("Error mengambil event:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    return (
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
          <p className="mt-4 text-gray-600 font-medium">Memuat konser...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-cyan-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">Temukan Konser Impianmu 🎤</h2>
          <p className="text-lg opacity-90 mb-8">Jangan lewatkan pengalaman musik terbaik!</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari konser, artis, atau kota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/50 shadow-xl"
              />
              <span className="absolute right-6 top-4 text-2xl">🔍</span>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Tidak ada konser ditemukan</h3>
            <p className="text-gray-500">Coba kata kunci lain</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event, index) => (
              <div
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
              >
                {/* Image */}
                <div className="relative overflow-hidden h-48">
                  <img
                    src={cardImages[index % cardImages.length]} // Pilih gambar berdasarkan index
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-pink-600">
                    {event.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <span className="mr-2">📍</span>
                    <span>{event.city}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm mb-4">
                    <span className="mr-2">📅</span>
                    <span>{new Date(event.start_date).toLocaleDateString("id-ID", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}</span>
                  </div>

                  <button className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold py-2.5 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all">
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-2xl">🎵</span>
            <h3 className="text-xl font-bold">TuneTix</h3>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 Tunetix. Semua hak dilindungi. Temukan konser impianmu!
          </p>
        </div>
      </footer>
    </div>
  );
}

export default EventListPage;
