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
	UserID  uint               `json:"user_id" binding:"required"`  // sementara kirim manual dari frontend/Postman
	EventID uint               `json:"event_id" binding:"required"` // event yang sedang dipesan
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
		EventID:     req.EventID,
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

	// reload biar event & ticket_type ikut kebawa di response
	if err := db.
		Preload("Items.TicketType").
		Preload("Event").
		First(&order, order.ID).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil detail order",
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
	if err := db.
		Preload("Items.TicketType").
		Preload("Event").
		First(&order, id).Error; err != nil {

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

// POST /orders/:id/pay
func PayOrder(c *gin.Context) {
	db := config.DB
	id := c.Param("id")

	// 1. Ambil order dulu
	var order models.Order
	if err := db.Preload("Items").First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Order tidak ditemukan",
		})
		return
	}

	// 2. Cek status order
	if order.Status == "PAID" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Order sudah dibayar",
		})
		return
	}
	if order.Status == "CANCELLED" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Order sudah dibatalkan",
		})
		return
	}

	// 3. Bind + validasi data pembayaran
	var req models.PaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errorsResp := validationErrorsToResponse(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"errors":  errorsResp,
		})
		return
	}

	// 4. Optional: cek nominal dari frontend = total order
	if int(req.Nominal) != order.TotalAmount {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Nominal pembayaran tidak sesuai dengan total order",
		})
		return
	}

	// 5. Anggap pembayaran selalu sukses (untuk TUBES)

	order.Status = "PAID"

	if err := db.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengupdate status order",
		})
		return
	}

	// reload kalau mau bawa event & item
	if err := db.
		Preload("Items.TicketType").
		Preload("Event").
		First(&order, order.ID).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil detail order setelah bayar",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pembayaran berhasil, order telah dibayar",
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
	if err := db.
		Preload("Items.TicketType").
		Preload("Event").
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
