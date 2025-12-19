package controllers

import (
	"net/http"

	"tubesimpal-backend/config"
	"tubesimpal-backend/models"

	"github.com/gin-gonic/gin"
)

// GET /events?search=&city=&category=&start_date=&end_date=
func GetEvents(c *gin.Context) {
	db := config.DB

	var events []models.Event

	// Query params
	search := c.Query("search")
	city := c.Query("city")
	category := c.Query("category")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	query := db.Model(&models.Event{})

	// 🔍 Search (title + description + city)
	if search != "" {
		like := "%" + search + "%"
		query = query.Where(
			"title LIKE ? OR description LIKE ? OR city LIKE ?",
			like, like, like,
		)
	}

	// 🏙 Filter city
	if city != "" {
		query = query.Where("city = ?", city)
	}

	// 🏷 Filter category
	if category != "" {
		query = query.Where("category = ?", category)
	}

	// 📅 Filter start date
	if startDate != "" {
		query = query.Where("start_date >= ?", startDate)
	}

	// 📅 Filter end date
	if endDate != "" {
		query = query.Where("end_date <= ?", endDate)
	}

	if err := query.Order("start_date ASC").Find(&events).Error; err != nil {
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
