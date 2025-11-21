package controllers

import (
	"net/http"
	"strconv"

	"tubesimpal-backend/config"
	"tubesimpal-backend/models"

	"github.com/gin-gonic/gin"
)

type OrderTicketInput struct {
	TicketTypeID uint `json:"ticket_type_id" binding:"required"`
	Quantity     int  `json:"quantity" binding:"required,gt=0"`
}

type CreateOrderInput struct {
	UserID  uint              `json:"user_id" binding:"required"`  // sementara kirim manual dari frontend/Postman
	EventID uint              `json:"event_id" binding:"required"`
	Tickets []OrderTicketInput `json:"tickets" binding:"required,dive"`
}

// POST /orders
func CreateOrder(c *gin.Context) {
	db := config.DB

	var req CreateOrderInput
	if err := c.ShouldBindJSON(&req); err != nil {
		errorsResp := validationErrorsToResponse(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"errors":  errorsResp,
		})
		return
	}

	// hitung total + siapkan items
	total := 0
	var items []models.OrderItem

	for _, t := range req.Tickets {
		var ticket models.TicketType
		if err := db.First(&ticket, t.TicketTypeID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Ticket type tidak ditemukan",
			})
			return
		}

		subtotal := ticket.Price * t.Quantity
		total += subtotal

		items = append(items, models.OrderItem{
			TicketTypeID: t.TicketTypeID,
			Quantity:     t.Quantity,
			UnitPrice:    ticket.Price,
			Subtotal:     subtotal,
		})
	}

	order := models.Order{
		UserID:      req.UserID,
		TotalAmount: total,
		Status:      "PENDING",
		Items:       items,
	}

	if err := db.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal membuat order",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    order,
	})
}

// GET /orders/:id
func GetOrderByID(c *gin.Context) {
	db := config.DB
	id := c.Param("id")

	var order models.Order
	if err := db.Preload("Items").First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Order tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    order,
	})
}

// POST /orders/:id/pay  (pseudo payment)
func PayOrder(c *gin.Context) {
	db := config.DB
	id := c.Param("id")

	var order models.Order
	if err := db.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Order tidak ditemukan",
		})
		return
	}

	if order.Status == "PAID" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Order sudah dibayar",
		})
		return
	}

	order.Status = "PAID"
	if err := db.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengupdate status order",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment success",
		"data":    order,
	})
}

// GET /me/orders?user_id=1   (sementara pakai query param)
func GetMyOrders(c *gin.Context) {
	db := config.DB

	userIDStr := c.Query("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "user_id wajib diisi (query param)",
		})
		return
	}

	uid, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "user_id tidak valid",
		})
		return
	}

	var orders []models.Order
	if err := db.Preload("Items").
		Where("user_id = ?", uint(uid)).
		Order("created_at DESC").
		Find(&orders).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil history order",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    orders,
	})
}
