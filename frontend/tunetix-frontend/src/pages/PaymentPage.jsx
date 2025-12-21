import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    metodePembayaran: "",
  });

  // ----- LOAD ORDER -----
  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`http://localhost:3000/orders/${id}`);
        if (!res.ok) {
          console.error("HTTP Error", res.status);
          setLoading(false);
          return;
        }

        const data = await res.json();
        const orderData = data.data || data;
        setOrder(orderData);
      } catch (err) {
        console.error("Fetch error:", err);
      }
      setLoading(false);
    }

    loadOrder();
  }, [id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ----- SUBMIT PAYMENT -----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!form.metodePembayaran) {
      setErrors({ metodePembayaran: "Pilih metode pembayaran" });
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/orders/${id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metodePembayaran: form.metodePembayaran,
          nominal: order.total_amount,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.success === false)) {
        alert(data?.message || "Gagal memproses pembayaran");
        return;
      }

      alert(data?.message || "Pembayaran berhasil");
      navigate("/me/orders");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Gagal terhubung ke server");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
          <p className="mt-4 text-gray-600 font-medium">Memuat pembayaran...</p>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg font-semibold">Order tidak ditemukan.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-cyan-50 py-12">
      <div className="max-w-md mx-auto bg-white shadow-xl rounded-3xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Pembayaran Order #{id}</h1>

        <p className="text-gray-700 mb-6">
          <span className="font-semibold">Total Pembayaran:</span>{" "}
          Rp{(order.total_amount || 0).toLocaleString("id-ID")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Nominal</label>
            <input
              type="text"
              value={`Rp ${(order.total_amount || 0).toLocaleString("id-ID")}`}
              readOnly
              className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Metode Pembayaran</label>
            <select
              value={form.metodePembayaran}
              onChange={(e) => handleChange("metodePembayaran", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">-- Pilih Metode --</option>
              <option value="TRANSFER">Transfer Bank</option>
              <option value="E_WALLET">E-Wallet</option>
            </select>
            {errors.metodePembayaran && (
              <p className="text-red-500 text-sm mt-1">{errors.metodePembayaran}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
          >
            Bayar Sekarang
          </button>
        </form>
      </div>
    </div>
  );
}