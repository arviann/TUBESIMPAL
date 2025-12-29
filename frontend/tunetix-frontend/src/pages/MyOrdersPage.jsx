import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const userId = storedUser?.id;

  // ✅ Redirect login SAFELY (jangan di render body)
  useEffect(() => {
    if (!userId) navigate("/auth/login");
  }, [userId, navigate]);

  useEffect(() => {
    async function loadOrders() {
      if (!userId) return;

      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/me/orders?user_id=${userId}`);
        const data = await res.json();

        if (data.success) {
          setOrders(data.data || []);
        } else {
          setError(data.message || "Gagal mengambil data pesanan");
        }
      } catch (err) {
        console.error(err);
        setError("Gagal terhubung ke server");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [userId]);

  // ✅ bikin mapping: order_id -> nomor urut per user (mulai 1)
  // Aku bikin urutannya berdasarkan created_at ASC (order pertama = #1)
  const orderNoMap = useMemo(() => {
    const map = new Map();

    const sortedAsc = [...orders].sort((a, b) => {
      const ta = new Date(a.created_at || 0).getTime();
      const tb = new Date(b.created_at || 0).getTime();
      return ta - tb; // ASC
    });

    sortedAsc.forEach((o, idx) => {
      map.set(Number(o.order_id), idx + 1);
    });

    return map;
  }, [orders]);

  const handleViewDetail = (order) => {
    const displayOrderNo = orderNoMap.get(Number(order.order_id)) || 1;
    navigate(`/order/${order.order_id}`, {
      state: {
        displayOrderNo,
      },
    });
  };

  if (!userId) return null;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
          <p className="mt-4 text-gray-600 font-medium">Memuat pesanan...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg font-semibold">
          Terjadi kesalahan: {error}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-cyan-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Pesanan Saya</h1>

        {orders.length === 0 && (
          <p className="text-gray-600">Belum ada pesanan.</p>
        )}

        <div className="space-y-6">
          {orders.map((order) => {
            const displayOrderNo =
              orderNoMap.get(Number(order.order_id)) || 1;

            return (
              <div
                key={order.order_id}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                {/* ✅ ini nomor urut per user */}
                <p>
                  <span className="font-semibold">Order #:</span> {displayOrderNo}
                  <span className="text-gray-400 ml-2">

                  </span>
                </p>

                {order.event && (
                  <>
                    <p>
                      <span className="font-semibold">Event:</span>{" "}
                      {order.event.title || order.event.name}
                    </p>
                    <p>
                      <span className="font-semibold">Lokasi:</span>{" "}
                      {order.event.location}
                    </p>
                  </>
                )}

                <p>
                  <span className="font-semibold">Total:</span>{" "}
                  Rp{(order.total_amount || 0).toLocaleString("id-ID")}
                </p>

                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={
                      order.status === "PAID"
                        ? "text-green-600 font-bold"
                        : order.status === "PENDING"
                        ? "text-yellow-500 font-bold"
                        : order.status === "CANCELLED"
                        ? "text-red-600 font-bold"
                        : "text-gray-600 font-bold"
                    }
                  >
                    {order.status}
                  </span>
                </p>

                <button
                  onClick={() => handleViewDetail(order)}
                  className="mt-4 w-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Lihat Detail
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
