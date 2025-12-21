import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const resEvent = await fetch(`http://localhost:3000/events/${id}`);
        const eventData = await resEvent.json();

        const resTickets = await fetch(`http://localhost:3000/events/${id}/tickets`);
        const ticketData = await resTickets.json();

        setEvent(eventData.data);
        setTickets(ticketData.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data event.");
        setLoading(false);
      }
    }
    loadData();
  }, [id]);
const storedUser = JSON.parse(localStorage.getItem("user"));

async function handleOrder(e) {
  e.preventDefault();

  if (!selectedTicket) {
    alert("Pilih jenis tiket terlebih dahulu");
    return;
  }

  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (!storedUser) {
    alert("Silakan login terlebih dahulu");
    navigate("/auth/login");
    return;
  }

  const payload = {
    user_id: storedUser.id, // ✅ DINAMIS
    event_id: Number(id),
    tickets: [
      {
        ticket_type_id: Number(selectedTicket),
        quantity: Number(quantity),
      },
    ],
  };

  try {
    const res = await fetch("http://localhost:3000/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!data.success) {
      alert("Gagal membuat order");
      return;
    }

    navigate(`/order/${data.data.order_id}`);
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan");
  }
}


  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
          <p className="mt-4 text-gray-600 font-medium">Memuat detail event...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg font-semibold">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-cyan-50 py-12">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden">
        {/* Event Image */}
        <div className="relative h-80">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {event.category}
          </div>
        </div>

        {/* Event Info */}
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{event.title}</h1>
          <div className="flex items-center text-gray-600 mb-2">
            <span className="mr-2">📍</span>
            <span>{event.city} — {event.location}</span>
          </div>
          <p className="text-gray-700 mb-6">{event.description}</p>

          {/* Ticket Form */}
          <h3 className="text-2xl font-bold mb-4">Beli Tiket 🎫</h3>
          <form onSubmit={handleOrder} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700">Jenis Tiket:</label>
              <select
                value={selectedTicket}
                onChange={(e) => setSelectedTicket(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">-- pilih tiket --</option>
                {tickets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — Rp{t.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">Jumlah:</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Beli Tiket
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}