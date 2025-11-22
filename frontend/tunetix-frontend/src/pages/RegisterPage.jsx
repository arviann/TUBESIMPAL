import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Registrasi berhasil! Silakan login.");
        navigate("/auth/login");
      } else {
        // backend format: { errors: [ { field, message } ] }
        if (data.errors && data.errors.length > 0) {
          setError(data.errors[0].message);
        } else {
          setError(data.message || "Registrasi gagal");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan server");
    }
  };

  return (
    <div style={{
      maxWidth: 420,
      margin: "60px auto",
      padding: 24,
      border: "1px solid #ddd",
      borderRadius: 8
    }}>
      <h2 style={{ textAlign: "center" }}>Register</h2>

      {error && (
        <p style={{ color: "red", marginTop: 10, textAlign: "center" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>

        <div>
          <label>Nama</label>
          <input
            type="text"
            value={name}
            placeholder="Nama lengkap"
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            placeholder="email@example.com"
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            placeholder="Minimal 8 karakter"
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: 20,
            width: "100%",
            padding: 10,
            background: "#4F46E5",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </form>

      <p style={{ marginTop: 16, textAlign: "center" }}>
        Sudah punya akun?{" "}
        <span
          style={{ color: "#4F46E5", cursor: "pointer" }}
          onClick={() => navigate("/auth/login")}
        >
          Login
        </span>
      </p>
    </div>
  );
}
