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

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`http://localhost:3000/orders/${id}`);
        
        // Cek apakah response valid
        if (!res.ok) {
          console.error("HTTP Error", res.status);
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
        } else {
          console.error("Backend error:", data.message);
        }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!form.metodePembayaran) {
      setErrors({ metodePembayaran: "Pilih metode pembayaran" });
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/orders/${id}pay`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    metodePembayaran: form.metodePembayaran,
  nominal: order.total_amount

  }),
});

      if (!res.ok) {
        alert("Gagal terhubung ke server");
        return;
      }

      const data = await res.json();

      if (!data.success) {
        alert("Gagal memproses pembayaran");
        return;
      }

      // Redirect aman
      navigate("/myorders");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Gagal memproses pembayaran");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Memuat pembayaran...</p>;
  if (!order) return <p style={{ padding: 20, color: "red" }}>Order tidak ditemukan.</p>;

  return (
    <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
      <h1>Pembayaran Order #{id}</h1>

      <p><b>Total Pembayaran:</b> Rp{(order.total_amount || 0).toLocaleString()}</p>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <label>Nominal</label>
        <input
          type="text"
          value={`Rp ${(order.total_amount || 0).toLocaleString()}`}
          readOnly
          style={{ width: "100%", padding: 8, marginBottom: 15, background: "#eee" }}
        />

        <label>Metode Pembayaran</label>
        <select
          value={form.metodePembayaran}
          onChange={(e) => handleChange("metodePembayaran", e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        >
          <option value="">-- Pilih Metode --</option>
          <option value="TRANSFER">Transfer Bank</option>
          <option value="E_WALLET">E-Wallet</option>
        </select>

        {errors.metodePembayaran && (
          <p style={{ color: "red" }}>{errors.metodePembayaran}</p>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            marginTop: 15,
            background: "black",
            color: "white",
            borderRadius: 8,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Bayar Sekarang
        </button>
      </form>
    </div>
  );
}
