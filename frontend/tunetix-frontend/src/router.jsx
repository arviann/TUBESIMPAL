import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EventListPage from "./pages/EventListPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import OrderPage from "./pages/OrderPage";
import PaymentPage from "./pages/PaymentPage";
import MyOrdersPage from "./pages/MyOrdersPage";

const router = createBrowserRouter([
  { path: "/", element: <EventListPage /> },
  { path: "/auth/login", element: <LoginPage /> },
  { path: "/auth/register", element: <RegisterPage /> },
  { path: "/events/:id", element: <EventDetailsPage /> },
  { path: "/order/:id", element: <OrderPage /> },
  { path: "/payment/:id", element: <PaymentPage /> },
  { path: "/me/orders", element: <MyOrdersPage /> },  // sudah benar
]);

export default router;
