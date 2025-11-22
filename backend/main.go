package main

import (
	"log"

	"tubesimpal-backend/config"
	"tubesimpal-backend/controllers"

	"github.com/gin-gonic/gin"
)

func main() {
	config.ConnectDatabase()

	r := gin.Default()

	// health check
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "TUBESIMPAL TuneTix API is running 🚀",
		})
	})

	// Auth
	r.POST("/auth/register", controllers.Register)
	r.POST("/auth/login", controllers.Login)

	// VALIDATION TUGAS LAMA (biarin)
	r.POST("/tickets/order", controllers.CreateTicketOrder)
	r.POST("/payments/charge", controllers.ChargePayment)

	// ==== ROUTE TUNETIX BARU ====

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

	log.Println("✅ Server running on http://localhost:3000")
	if err := r.Run(":3000"); err != nil {
		log.Fatal("Server error:", err)
	}
}
