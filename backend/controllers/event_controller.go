package controllers

import (
	"net/http"

	"tubesimpal-backend/config"
	"tubesimpal-backend/models"

	"github.com/gin-gonic/gin"
)

// GET /events?city=Jakarta
func GetEvents(c *gin.Context) {
	db := config.DB

	var events []models.Event
	city := c.Query("city")

	query := db
	if city != "" {
		query = query.Where("city = ?", city)
	}

	if err := query.Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil data event",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    events,
	})
}

// GET /events/:id
func GetEventByID(c *gin.Context) {
	db := config.DB
	id := c.Param("id")

	var event models.Event
	if err := db.First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Event tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    event,
	})
}

// GET /events/:id/tickets
func GetTicketsByEvent(c *gin.Context) {
	db := config.DB
	id := c.Param("id")

	var tickets []models.TicketType
	if err := db.Where("event_id = ?", id).Find(&tickets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil data tiket",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    tickets,
	})
}
