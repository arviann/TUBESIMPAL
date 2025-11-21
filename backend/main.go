package main

import (
	"log"

	"tubesimpal-backend/config"
	"tubesimpal-backend/controllers"

	"github.com/gin-gonic/gin"
)

func main() {
	// koneksi DB
	config.ConnectDatabase()

	// init Gin
	r := gin.Default()

	// route healthcheck
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "TUBESIMPAL TuneTix API is running 🚀",
		})
	})

	// route payment
	r.POST("/payments/charge", controllers.ChargePayment)

	log.Println("✅ Server running on http://localhost:3000")
	if err := r.Run(":3000"); err != nil {
		log.Fatal("Server error:", err)
	}
}
