import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch(`http://localhost:3000/orders/user/${userId}`);
        const data = await res.json();

        if (data.success) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }

    loadOrders();
  }, [userId]);

  if (loading) return <p style={{ padding: 20 }}>Memuat pesanan...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Pesanan Saya</h1>

      {orders.length === 0 && <p>Belum ada pesanan.</p>}

      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 15,
            marginBottom: 15,
          }}
        >
          <p><b>ID Pesanan:</b> {order.id}</p>
          <p><b>Total:</b> Rp{order.total_amount.toLocaleString()}</p>
          <p><b>Status:</b> {order.status}</p>

          <button
            onClick={() => navigate(`/order/${order.id}`)}
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
