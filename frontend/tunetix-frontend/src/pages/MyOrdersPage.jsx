import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // TODO: idealnya ambil dari login
  const storedUserId = localStorage.getItem("userId");
  const userId = storedUserId || 1; // sementara default 1 biar jalan

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `${API_BASE}/me/orders?user_id=${userId}`
        );

        if (!res.ok) {
          setError(`HTTP error ${res.status}`);
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (data.success) {
          setOrders(data.data || []);
        } else {
          setError(data.message || "Gagal mengambil data pesanan");
        }
      } catch (err) {
        console.error(err);
        setError("Gagal terhubung ke server");
      }

      setLoading(false);
    }

    loadOrders();
  }, [userId]);

  if (loading) return <p style={{ padding: 20 }}>Memuat pesanan...</p>;
  if (error)
    return (
      <p style={{ padding: 20, color: "red" }}>
        Terjadi kesalahan: {error}
      </p>
    );

  return (
    <div style={{ padding: 20 }}>
      <h1>Pesanan Saya</h1>

      {orders.length === 0 && <p>Belum ada pesanan.</p>}

      {orders.map((order) => (
        <div
          key={order.order_id} // ✅ pakai order_id, bukan id
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 15,
            marginBottom: 15,
          }}
        >
          <p>
            <b>ID Pesanan:</b> {order.order_id}
          </p>

          {order.event && (
            <>
              <p>
                <b>Event:</b> {order.event.name}
              </p>
              <p>
                <b>Lokasi:</b> {order.event.location}
              </p>
            </>
          )}

          <p>
            <b>Total:</b> Rp
            {(order.total_amount || 0).toLocaleString("id-ID")}
          </p>
          <p>
            <b>Status:</b> {order.status}
          </p>

          <button
            onClick={() => navigate(`/order/${order.order_id}`)} // ✅ pakai order_id
            style={{
              marginTop: 10,
              padding: 10,
              background: "black",
              color: "white",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Lihat Detail
          </button>
        </div>
      ))}
    </div>
  );
}
