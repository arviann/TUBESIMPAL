import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [storedUser, setStoredUser] = useState(() => {
  return JSON.parse(localStorage.getItem("user"));
});

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 🚨 Redirect jika belum login
  useEffect(() => {
    if (!storedUser?.id) {
      navigate("/auth/login");
    }
  }, [storedUser, navigate]);

  // 📥 Load profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(
          `${API_BASE}/profile?user_id=${storedUser.id}`
        );
        const data = await res.json();

        if (data.success) {
          setName(data.data.name);
          setEmail(data.data.email);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (storedUser?.id) fetchProfile();
  }, [storedUser?.id]);

  // ✏️ Update profile
  const handleUpdateProfile = async (e) => {
  e.preventDefault();
  setMessage("");

  try {
    const res = await fetch("http://localhost:3000/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: storedUser.id,
        name: name.trim(),
        email: email.trim(),
      }),
    });

    const data = await res.json();

    if (data.success) {
      setMessage("Profil berhasil diperbarui");

      // 🔥 INI KUNCI UTAMA (SEBELUMNYA SERING LUPA)
      const updatedUser = {
        ...storedUser,
        name,
        email,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
    } else {
      setMessage(data.message || "Gagal update profil");
    }
  } catch (err) {
    console.error(err);
    setMessage("Terjadi kesalahan server");
  }
};


  // 🔐 Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch(`${API_BASE}/profile/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: storedUser.id,
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setMessage("Password berhasil diganti");
      setOldPassword("");
      setNewPassword("");
    } else {
      setMessage(data.message || "Gagal mengganti password");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat profil...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-cyan-50 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6">👤 Profile Saya</h1>

        {message && (
          <div className="mb-4 text-sm text-center text-blue-600">
            {message}
          </div>
        )}

        {/* UPDATE PROFILE */}
        <form onSubmit={handleUpdateProfile} className="space-y-4 mb-8">

  {/* NAMA */}
  <div>
    <label className="block text-sm font-semibold mb-1">Nama</label>
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="w-full border px-3 py-2 rounded-lg"
      placeholder="Nama"
    />
  </div>

  {/* EMAIL */}
  <div>
    <label className="block text-sm font-semibold mb-1">Email</label>
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full border px-3 py-2 rounded-lg"
      placeholder="Email"
    />
  </div>

  <button
    type="submit"
    className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white py-2 rounded-lg font-bold"
  >
    Simpan Profil
  </button>
</form>

        {/* CHANGE PASSWORD */}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <h2 className="font-bold">🔐 Ganti Password</h2>

          <input
            type="password"
            placeholder="Password lama"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
            required
          />

          <input
            type="password"
            placeholder="Password baru"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
            required
          />

          <button className="w-full bg-gray-800 text-white py-2 rounded-lg">
            Ganti Password
          </button>
        </form>
      </div>
    </div>
  );
}