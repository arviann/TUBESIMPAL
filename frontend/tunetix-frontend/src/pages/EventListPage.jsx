import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function EventListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("http://localhost:3000/events");
        const json = await res.json();

        if (json.success) {
          setEvents(json.data);
        }
      } catch (err) {
        console.error("Error mengambil event:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Daftar Event</h1>

      <div style={styles.grid}>
        {events.map((event) => (
          <div
            key={event.id}
            style={styles.card}
            onClick={() => navigate(`/events/${event.id}`)}
          >
            <img src={event.image_url} alt={event.title} style={styles.image} />

            <div style={styles.content}>
              <h3>{event.title}</h3>
              <p style={styles.city}>{event.city}</p>
              <p style={styles.date}>
                {new Date(event.start_date).toLocaleDateString("id-ID")} •{" "}
                {event.category}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "30px" },
  title: { fontSize: "28px", marginBottom: "20px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "0.2s",
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
  },
  content: {
    padding: "15px",
  },
  city: {
    color: "gray",
    margin: "5px 0",
  },
  date: {
    fontSize: "14px",
    color: "#555",
  },
};

export default EventListPage;
