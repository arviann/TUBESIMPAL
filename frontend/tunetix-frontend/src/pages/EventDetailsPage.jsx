import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EventDetailsPage() {
  const { id } = useParams(); // event_id
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH EVENT DETAILS
  // =========================
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch detail event
        const resEvent = await fetch(`http://localhost:3000/events/${id}`);
        const eventData = await resEvent.json();

        // Fetch ticket types
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

  // =========================
  // HANDLE CREATE ORDER
  // =========================
  async function handleOrder(e) {
    e.preventDefault();

    if (!selectedTicket) {
      alert("Pilih jenis tiket terlebih dahulu");
      return;
    }

    const payload = {
      user_id: 1,        // sementara hardcode (nanti ambil dari auth)
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

      const orderId = data.data.order_id;

      // redirect ke /order/:id
      navigate(`/order/${orderId}`);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    }
  }

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (error) return <p style={{ padding: 20, color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{event.title}</h1>

      <img
        src={event.image_url}
        alt={event.title}
        style={{ width: "100%", maxWidth: 500, borderRadius: 10 }}
      />

      <p><b>Kota:</b> {event.city}</p>
      <p><b>Lokasi:</b> {event.location}</p>
      <p><b>Kategori:</b> {event.category}</p>
      <p><b>Deskripsi:</b> {event.description}</p>

      <h3 style={{ marginTop: 30 }}>Beli Tiket</h3>

      <form onSubmit={handleOrder}>
        <label>Jenis Tiket:</label>
        <select
          value={selectedTicket}
          onChange={(e) => setSelectedTicket(e.target.value)}
          required
          style={{ display: "block", marginBottom: 10 }}
        >
          <option value="">-- pilih tiket --</option>

          {tickets.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} — Rp{t.price.toLocaleString()}
            </option>
          ))}
        </select>

        <label>Jumlah:</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          style={{ display: "block", marginBottom: 20 }}
        />

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            background: "black",
            color: "white",
            borderRadius: 5,
          }}
        >
          Beli Tiket
        </button>
      </form>
    </div>
  );
}
