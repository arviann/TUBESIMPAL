package main

import (
	"log"
	"time"

	"tubesimpal-backend/config"
	"tubesimpal-backend/controllers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Connect to database
	config.ConnectDatabase()

	r := gin.Default()

	// ===== CORS CONFIG =====
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // React frontend origin
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true, // penting kalau pakai cookies / token
		MaxAge:           12 * time.Hour,
	}))

	// ===== HEALTH CHECK =====
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "TUBESIMPAL TuneTix API is running 🚀",
		})
	})

	// ===== AUTH =====
	r.POST("/auth/register", controllers.Register)
	r.POST("/auth/login", controllers.Login)

	// ===== VALIDATION TUGAS LAMA =====
	r.POST("/tickets/order", controllers.CreateTicketOrder)
	r.POST("/payments/charge", controllers.ChargePayment)

	// ===== ROUTE TUNETIX BARU =====
	// Events
	r.GET("/events", controllers.GetEvents)
	r.GET("/events/:id", controllers.GetEventByID)
	r.GET("/events/:id/tickets", controllers.GetTicketsByEvent)

	// Orders + Payment
	r.POST("/orders", controllers.CreateOrder)
	r.GET("/orders/:id", controllers.GetOrderByID)
	r.POST("/orders/:id/pay", controllers.PayOrder)

	// Dashboard user (My Orders)
	r.GET("/me/orders", controllers.GetMyOrders)

	// ===== START SERVER =====
	log.Println("✅ Server running on http://localhost:3000")
	if err := r.Run(":3000"); err != nil {
		log.Fatal("Server error:", err)
	}
}