import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

export default function OrderPage() {
  const { id } = useParams(); // order_id
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  // ambil user dari localStorage (key: "user")
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const userId = storedUser?.id;

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/orders/${id}`);
      const data = await res.json();

      if (data?.success) {
        setOrder(data.data);
      } else {
        setOrder(null);
      }
    } catch (err) {
      console.error("Load order error:", err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = async () => {
    if (!order) return;

    // harus login
    if (!userId) {
      alert("Kamu harus login dulu untuk membatalkan order.");
      navigate("/auth/login");
      return;
    }

    // extra guard: kalau order ini bukan milik user, stop di FE biar ga buang request
    if (order.user_id && Number(order.user_id) !== Number(userId)) {
      alert("Tidak punya akses ke order ini (order bukan milik akun kamu).");
      return;
    }

    const ok = window.confirm("Yakin mau cancel order ini?");
    if (!ok) return;

    try {
      setCancelLoading(true);

      // ✅ sesuai backend: user_id dikirim via query param
      const res = await fetch(
        `${API_BASE}/orders/${order.order_id}/cancel?user_id=${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        alert(data?.message || "Gagal membatalkan order");
        return;
      }

      // update state langsung (backend kamu return data order terbaru)
      if (data?.data) {
        setOrder(data.data);
      } else {
        setOrder((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev));
      }

      alert(data?.message || "Order berhasil dibatalkan");
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Gagal terhubung ke server");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
          <p className="mt-4 text-gray-600 font-medium">Memuat order...</p>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg font-semibold">Order tidak ditemukan.</p>
      </div>
    );

  const statusClass =
    order.status === "PAID"
      ? "text-green-600 font-bold"
      : order.status === "PENDING"
      ? "text-yellow-500 font-bold"
      : order.status === "CANCELLED"
      ? "text-red-600 font-bold"
      : "text-gray-600 font-bold";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-cyan-50 py-12">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-3xl p-8">
        {/* Header: Back di kiri judul */}
        <div className="flex items-center gap-4 mb-4">
          {/* Back to event (kiri judul) */}
          {order.event_id ? (
            <Link
              to={`/events/${order.event_id}`}
              className="text-pink-600 font-bold hover:underline"
            >
              ← Back
            </Link>
          ) : (
            <button
              onClick={() => window.history.back()}
              className="text-pink-600 font-bold hover:underline"
            >
              ← Back
            </button>
          )}

          <h1 className="text-3xl font-bold text-gray-800">
            Order #{order.order_id}
          </h1>
        </div>

        <div className="text-gray-700 mb-6">
          <p>
            <span className="font-semibold">Status:</span>{" "}
            <span className={statusClass}>{order.status}</span>
          </p>
          <p>
            <span className="font-semibold">Total:</span>{" "}
            Rp{(order.total_amount || 0).toLocaleString()}
          </p>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-4">Detail Tiket 🎫</h3>

        <div className="space-y-4">
          {order.items?.length === 0 ? (
            <p className="text-gray-600">Tidak ada tiket.</p>
          ) : (
            order.items?.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <p>
                  <span className="font-semibold">Tiket ID:</span>{" "}
                  {item.ticket_type_id}
                </p>
                <p>
                  <span className="font-semibold">Jumlah:</span> {item.quantity}
                </p>
                <p>
                  <span className="font-semibold">Harga Satuan:</span>{" "}
                  Rp{(item.unit_price || 0).toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">Subtotal:</span>{" "}
                  Rp{(item.subtotal || 0).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-8 space-y-3">
          {/* Pay button only when pending */}
          {order.status === "PENDING" && (
            <Link to={`/payment/${order.order_id}`}>
              <button className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all">
                💳 Lanjutkan Ke Pembayaran
              </button>
            </Link>
          )}

          {/* Cancel button only when pending */}
          {order.status === "PENDING" && (
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className={`w-full py-3 rounded-xl font-bold border transition-all ${
                cancelLoading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white text-red-600 border-red-300 hover:bg-red-50"
              }`}
            >
              {cancelLoading ? "Mencancel..." : "❌ Cancel Order"}
            </button>
          )}

          {/* Paid text */}
          {order.status === "PAID" && (
            <p className="text-green-600 font-bold text-lg">
              ✔ Pembayaran sudah berhasil. Tiket siap digunakan.
            </p>
          )}

          {/* Cancelled text */}
          {order.status === "CANCELLED" && (
            <p className="text-red-600 font-bold text-lg">
              ✖ Order sudah dibatalkan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
