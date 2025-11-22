import { Link } from "react-router-dom";

export default function EventCard({ event }) {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, margin: 8 }}>
      <h3>{event.title}</h3>
      <p>{event.date}</p>
      <Link to={`/events/${event.id}`}>Lihat Detail</Link>
    </div>
  );
}
