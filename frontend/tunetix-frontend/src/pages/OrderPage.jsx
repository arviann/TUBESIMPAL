import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

const API_BASE = "http://localhost:3000";

export default function OrderPage() {
  const { id } = useParams(); // order_id (db id)
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  // nomor urut per-user (UI)
  const [displayOrderNo, setDisplayOrderNo] = useState(
    location.state?.displayOrderNo || null
  );

  // ambil user dari localStorage (key: "user")
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const userId = storedUser?.id;

  // redirect kalau belum login
  useEffect(() => {
    if (!userId) navigate("/auth/login");
  }, [userId, navigate]);

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
    if (!userId) return;
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, userId]);

  // ✅ kalau displayOrderNo belum ada (misal direct URL), kita hitung dari /me/orders
  useEffect(() => {
    async function computeDisplayNo() {
      if (!userId) return;
      if (displayOrderNo) return; // udah ada dari state
      if (!order?.order_id) return;

      try {
        const res = await fetch(`${API_BASE}/me/orders?user_id=${userId}`);
        const data = await res.json();
        if (!data?.success) return;

        const orders = data.data || [];

        // urut oldest->newest, cari index order ini
        const sortedAsc = [...orders].sort((a, b) => {
          const ta = new Date(a.created_at || 0).getTime();
          const tb = new Date(b.created_at || 0).getTime();
          return ta - tb;
        });

        const idx = sortedAsc.findIndex(
          (o) => Number(o.order_id) === Number(order.order_id)
        );

        if (idx >= 0) setDisplayOrderNo(idx + 1);
      } catch (e) {
        console.error("computeDisplayNo error:", e);
      }
    }

    computeDisplayNo();
  }, [userId, order, displayOrderNo]);

  // ✅ Guard: kalau order bukan milik user → tendang ke MyOrders
  useEffect(() => {
    if (!order || !userId) return;

    if (order.user_id && Number(order.user_id) !== Number(userId)) {
      alert("Tidak punya akses ke order ini (order bukan milik akun kamu).");
      navigate("/me/orders");
    }
  }, [order, userId, navigate]);

  const handleCancel = async () => {
    if (!order) return;
    if (!userId) {
      alert("Kamu harus login dulu untuk membatalkan order.");
      navigate("/auth/login");
      return;
    }

    const ok = window.confirm("Yakin mau cancel order ini?");
    if (!ok) return;

    try {
      setCancelLoading(true);

      // sesuai backend: user_id dikirim via query param
      const res = await fetch(
        `${API_BASE}/orders/${order.order_id}/cancel?user_id=${userId}`,
        { method: "POST" }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        alert(data?.message || "Gagal membatalkan order");
        return;
      }

      // update state langsung
      if (data?.data) setOrder(data.data);
      else setOrder((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev));

      alert(data?.message || "Order berhasil dibatalkan");
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Gagal terhubung ke server");
    } finally {
      setCancelLoading(false);
    }
  };

  // ====== QR TOKEN (random tapi persistent per order) ======
  const qrValue = useMemo(() => {
    if (!order?.order_id || !userId) return "";

    const key = `tunetix_qr_order_${order.order_id}`;
    let token = localStorage.getItem(key);

    if (!token) {
      // random uuid kalau ada, fallback kalau browser ga support
      const rand =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      token = `TUNETIX|ORDER:${order.order_id}|USER:${userId}|EVENT:${order.event_id || "-"}|TOKEN:${rand}`;
      localStorage.setItem(key, token);
    }

    return token;
  }, [order?.order_id, order?.event_id, userId]);

  if (!userId) return null;

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
        <p className="text-red-500 text-lg font-semibold">
          Order tidak ditemukan.
        </p>
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

  const shownOrderNo = displayOrderNo || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-cyan-50 py-12">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-3xl p-8">
        {/* Header: Back di kiri judul */}
        <div className="flex items-center gap-4 mb-4">
          {order.event_id ? (
            <Link
              to={`/events/${order.event_id}`}
              className="text-pink-600 font-bold hover:underline"
            >
              ← Back
            </Link>
          ) : (
            <button
              onClick={() => navigate("/me/orders")}
              className="text-pink-600 font-bold hover:underline"
            >
              ← Back
            </button>
          )}

          {/* ✅ pakai nomor urut per user */}
          <h1 className="text-3xl font-bold text-gray-800">
            Order #{shownOrderNo}
            <span className="text-gray-400 text-base font-medium ml-2"></span>
          </h1>
        </div>

        <div className="text-gray-700 mb-6">
          <p>
            <span className="font-semibold">Status:</span>{" "}
            <span className={statusClass}>{order.status}</span>
          </p>
          <p>
            <span className="font-semibold">Total:</span>{" "}
            Rp{(order.total_amount || 0).toLocaleString("id-ID")}
          </p>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Detail Tiket
        </h3>

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
                  Rp{(item.unit_price || 0).toLocaleString("id-ID")}
                </p>
                <p>
                  <span className="font-semibold">Subtotal:</span>{" "}
                  Rp{(item.subtotal || 0).toLocaleString("id-ID")}
                </p>
              </div>
            ))
          )}
        </div>

        {/* ✅ QR CODE: hanya kalau PAID */}
        {order.status === "PAID" && (
          <div className="mt-8 border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
            <h4 className="text-xl font-bold text-gray-800 mb-4">
              QR Ticket
            </h4>

            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <QRCodeCanvas
                  value={qrValue || "TUNETIX-EMPTY"}
                  size={180}
                  includeMargin={true}
                />
              </div>
            </div>

            <p className="mt-4 text-gray-700 font-medium">
              Gunakan QR ini untuk Penukaran Tiket Fisik
            </p>

            {/* optional: kecilin info token biar keliatan developer mode (boleh hapus kalau ga mau) */}
            <p className="mt-2 text-xs text-gray-400 break-all">
              {qrValue}
            </p>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="mt-8 space-y-3">
          {order.status === "PENDING" && (
            <Link to={`/payment/${order.order_id}`}>
              <button className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all">
                💳 Lanjutkan Ke Pembayaran
              </button>
            </Link>
          )}

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

          {order.status === "PAID" && (
            <p className="text-green-600 font-bold text-lg">
              ✔ Pembayaran sudah berhasil. Tiket siap digunakan.
            </p>
          )}

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
