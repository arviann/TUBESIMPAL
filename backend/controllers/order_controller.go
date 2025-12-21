package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"tubesimpal-backend/config"
	"tubesimpal-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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
// Create order PENDING (kuota belum berkurang)
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

	// Validasi event ada
	var ev models.Event
	if err := db.First(&ev, req.EventID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Event tidak ditemukan",
		})
		return
	}

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

		// Pastikan ticket type ini milik event yang sama
		if ticket.EventID != req.EventID {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Ticket type tidak sesuai dengan event yang dipilih",
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
		Event:       ev,
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
// Proper: saat PAID, baru kurangi quota ticket_types (dengan transaction + lock)
func PayOrder(c *gin.Context) {
	db := config.DB
	idParam := c.Param("id")

	// parse id
	orderID64, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "ID order tidak valid",
		})
		return
	}
	orderID := uint(orderID64)

	// 1) Bind + validasi data pembayaran
	var payReq models.PaymentRequest
	if err := c.ShouldBindJSON(&payReq); err != nil {
		errorsResp := validationErrorsToResponse(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"errors":  errorsResp,
		})
		return
	}

	// 2) Transaction agar aman dari race condition
	err = db.Transaction(func(tx *gorm.DB) error {
		// Ambil order + items (items wajib buat reduce quota)
		var order models.Order
		if err := tx.Preload("Items").First(&order, orderID).Error; err != nil {
			return err
		}

		// Cek status order
		if order.Status == "PAID" {
			return fmt.Errorf("ORDER_ALREADY_PAID")
		}
		if order.Status == "CANCELLED" {
			return fmt.Errorf("ORDER_CANCELLED")
		}
		if order.Status != "PENDING" {
			return fmt.Errorf("ORDER_STATUS_INVALID")
		}

		// Optional: cek nominal dari frontend = total order
		if payReq.Nominal != order.TotalAmount {
			return fmt.Errorf("NOMINAL_MISMATCH")
		}

		// 3) Kurangi quota per ticket_type (LOCK row ticket_types)
		for _, it := range order.Items {
			if it.Quantity <= 0 {
				return fmt.Errorf("INVALID_QTY")
			}

			var tt models.TicketType

			// Row lock: SELECT ... FOR UPDATE
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
				First(&tt, it.TicketTypeID).Error; err != nil {
				return err
			}

			// Pastikan ticket type milik event yang sama
			if tt.EventID != order.EventID {
				return fmt.Errorf("TICKET_NOT_BELONG_TO_EVENT")
			}

			// Karena Quota = *int, handle nil
			currentQuota := 0
			if tt.Quota != nil {
				currentQuota = *tt.Quota
			}

			// Cek quota cukup
			if currentQuota < it.Quantity {
				return fmt.Errorf("QUOTA_NOT_ENOUGH")
			}

			// Kurangi quota
			newQuota := currentQuota - it.Quantity
			tt.Quota = &newQuota

			if err := tx.Save(&tt).Error; err != nil {
				return err
			}
		}

		// 4) Update status order jadi PAID
		if err := tx.Model(&models.Order{}).
			Where("id = ?", order.ID).
			Update("status", "PAID").Error; err != nil {
			return err
		}

		return nil
	})

	// 3) Handle error transaction
	if err != nil {
		switch err.Error() {
		case "ORDER_ALREADY_PAID":
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Order sudah dibayar"})
			return
		case "ORDER_CANCELLED":
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Order sudah dibatalkan"})
			return
		case "ORDER_STATUS_INVALID":
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Status order tidak valid untuk dibayar"})
			return
		case "NOMINAL_MISMATCH":
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Nominal pembayaran tidak sesuai dengan total order"})
			return
		case "QUOTA_NOT_ENOUGH":
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Kuota tiket tidak mencukupi"})
			return
		case "TICKET_NOT_BELONG_TO_EVENT":
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Ticket type tidak sesuai dengan event order"})
			return
		case "INVALID_QTY":
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Quantity item tidak valid"})
			return
		default:
			// kalau order tidak ditemukan
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Order tidak ditemukan"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal memproses pembayaran"})
			return
		}
	}

	// 4) Reload order buat response lengkap
	var out models.Order
	if err := db.
		Preload("Items.TicketType").
		Preload("Event").
		First(&out, orderID).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Pembayaran sukses, tapi gagal mengambil detail order",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pembayaran berhasil, order telah dibayar",
		"data":    out,
	})
}

// POST /orders/:id/cancel
func CancelOrder(c *gin.Context) {
	db := config.DB
	idParam := c.Param("id")

	// parse id
	orderID64, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "ID order tidak valid",
		})
		return
	}
	orderID := uint(orderID64)

	// OPTIONAL: kalau kamu mau cancel harus kirim user_id (sementara)
	// Kalau belum perlu, kamu bisa hapus validasi user ini
	userIDStr := c.Query("user_id")
	var userID uint
	if userIDStr != "" {
		uid, err := strconv.ParseUint(userIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "user_id tidak valid",
			})
			return
		}
		userID = uint(uid)
	}

	// Transaction
	err = db.Transaction(func(tx *gorm.DB) error {
		var order models.Order
		q := tx.Preload("Items").First(&order, orderID)
		if q.Error != nil {
			return q.Error
		}

		// Optional: validasi order milik user (kalau query user_id dikirim)
		if userIDStr != "" && order.UserID != userID {
			return fmt.Errorf("FORBIDDEN")
		}

		// Kalau sudah cancelled
		if order.Status == "CANCELLED" {
			return fmt.Errorf("ORDER_ALREADY_CANCELLED")
		}

		// Kalau sudah paid, kamu mau gimana?
		// Untuk tugas kampus, biasanya:
		// - Boleh cancel PAID (anggap refund) -> restore quota
		// - Atau larang cancel PAID
		//
		// Aku buat versi: BOLEH cancel PAID + restore quota.
		restoreQuota := false
		if order.Status == "PAID" {
			restoreQuota = true
		} else if order.Status == "PENDING" {
			restoreQuota = false // kuota belum pernah berkurang
		} else {
			return fmt.Errorf("ORDER_STATUS_INVALID")
		}

		// Restore quota kalau order sudah PAID
		if restoreQuota {
			for _, it := range order.Items {
				if it.Quantity <= 0 {
					return fmt.Errorf("INVALID_QTY")
				}

				var tt models.TicketType
				if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
					First(&tt, it.TicketTypeID).Error; err != nil {
					return err
				}

				currentQuota := 0
				if tt.Quota != nil {
					currentQuota = *tt.Quota
				}

				newQuota := currentQuota + it.Quantity
				tt.Quota = &newQuota

				if err := tx.Save(&tt).Error; err != nil {
					return err
				}
			}
		}

		// Update status jadi CANCELLED
		if err := tx.Model(&models.Order{}).
			Where("id = ?", order.ID).
			Update("status", "CANCELLED").Error; err != nil {
			return err
		}

		return nil
	})

	// Handle errors
	if err != nil {
		switch err.Error() {
		case "ORDER_ALREADY_CANCELLED":
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Order sudah dibatalkan"})
			return
		case "ORDER_STATUS_INVALID":
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Status order tidak valid untuk dibatalkan"})
			return
		case "FORBIDDEN":
			c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Tidak punya akses ke order ini"})
			return
		case "INVALID_QTY":
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Quantity item tidak valid"})
			return
		default:
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Order tidak ditemukan"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal membatalkan order"})
			return
		}
	}

	// Reload untuk response
	var out models.Order
	if err := db.
		Preload("Items.TicketType").
		Preload("Event").
		First(&out, orderID).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Order dibatalkan, tapi gagal mengambil detail order",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Order berhasil dibatalkan",
		"data":    out,
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
