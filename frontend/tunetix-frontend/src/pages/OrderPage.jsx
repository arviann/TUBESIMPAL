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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-cyan-50 py-12">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-3xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Order #{order.order_id}</h1>

        <div className="text-gray-700 mb-6">
          <p>
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={
                order.status === "PAID"
                  ? "text-green-600 font-bold"
                  : order.status === "PENDING"
                  ? "text-yellow-500 font-bold"
                  : "text-gray-600 font-bold"
              }
            >
              {order.status}
            </span>
          </p>
          <p>
            <span className="font-semibold">Total:</span> Rp{order.total_amount.toLocaleString()}
          </p>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-4">Detail Tiket 🎫</h3>
        <div className="space-y-4">
          {order.items.length === 0 ? (
            <p className="text-gray-600">Tidak ada tiket.</p>
          ) : (
            order.items.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <p>
                  <span className="font-semibold">Tiket ID:</span> {item.ticket_type_id}
                </p>
                <p>
                  <span className="font-semibold">Jumlah:</span> {item.quantity}
                </p>
                <p>
                  <span className="font-semibold">Harga Satuan:</span> Rp{item.unit_price.toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">Subtotal:</span> Rp{item.subtotal.toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        {order.status === "PENDING" && (
          <div className="mt-8">
            <Link to={`/payment/${order.order_id}`}>
              <button className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all">
                💳 Lanjutkan Ke Pembayaran
              </button>
            </Link>
          </div>
        )}

        {order.status === "PAID" && (
          <p className="mt-8 text-green-600 font-bold text-lg">
            ✔ Pembayaran sudah berhasil. Tiket siap digunakan.
          </p>
        )}
      </div>
    </div>
  );
}
