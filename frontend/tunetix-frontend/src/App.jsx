import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EventListPage from "./pages/EventListPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import OrderPage from "./pages/OrderPage";
import PaymentPage from "./pages/PaymentPage";
import MyOrdersPage from "./pages/MyOrdersPage"; // 🔥 tambahin ini
import Navbar from "./components/Navbar";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<EventListPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/events" element={<EventListPage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />
        <Route path="/order/:id" element={<OrderPage />} />
        <Route path="/payment/:id" element={<PaymentPage />} />

        {/* ✅ My Orders, kamu bisa akses via /myorders atau /me/orders */}
        <Route path="/myorders" element={<MyOrdersPage />} />
        <Route path="/me/orders" element={<MyOrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />

      </Routes>
    </>
  );
}

export default App;
