import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function OrderPage() {
  const { id } = useParams(); // order_id

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`http://localhost:3000/orders/${id}`);
        const data = await res.json();

        if (data.success) {
          setOrder(data.data);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) return <p style={{ padding: 20 }}>Memuat order...</p>;
  if (!order) return <p style={{ padding: 20, color: "red" }}>Order tidak ditemukan.</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Order #{order.order_id}</h1>

      <p><b>Status:</b> {order.status}</p>
      <p><b>Total:</b> Rp{order.total_amount.toLocaleString()}</p>

      <h3 style={{ marginTop: 20 }}>Detail Tiket</h3>

      <div style={{ marginTop: 10 }}>
        {order.items.length === 0 ? (
          <p>Tidak ada tiket.</p>
        ) : (
          order.items.map((item) => (
            <div
              key={item.id}
              style={{
                marginBottom: 15,
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 6,
              }}
            >
              <p><b>Tiket ID:</b> {item.ticket_type_id}</p>
              <p><b>Jumlah:</b> {item.quantity}</p>
              <p><b>Harga Satuan:</b> Rp{item.unit_price.toLocaleString()}</p>
              <p><b>Subtotal:</b> Rp{item.subtotal.toLocaleString()}</p>
            </div>
          ))
        )}
      </div>

      {order.status === "PENDING" && (
        <div style={{ marginTop: 30 }}>
          <Link to={`/payment/${order.order_id}`}>
            <button
              style={{
                padding: "12px 20px",
                background: "black",
                color: "white",
                borderRadius: 8,
                fontSize: 16,
                width: "100%",
                cursor: "pointer",
              }}
            >
              💳 Lanjutkan Ke Pembayaran
            </button>
          </Link>
        </div>
      )}

      {order.status === "PAID" && (
        <p style={{ marginTop: 20, color: "green", fontWeight: "bold" }}>
          ✔ Pembayaran sudah berhasil. Tiket siap digunakan.
        </p>
      )}
    </div>
  );
}
