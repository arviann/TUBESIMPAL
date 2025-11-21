package controllers

import (
	"net/http"

	"tubesimpal-backend/models"

	"github.com/gin-gonic/gin"
)

// ChargePayment menangani POST /payments/charge
func ChargePayment(c *gin.Context) {
	var req models.PaymentRequest

	// Bind + validasi otomatis berdasarkan tag `binding`
	if err := c.ShouldBindJSON(&req); err != nil {
		errors := validationErrorsToResponse(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"errors":  errors,
		})
		return
	}

	// Di sini kamu bisa tambah logika lain:
	// - cek limit, fraud detection, dsb.
	// Untuk TUBES: cukup sampai validasi dulu.

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pembayaran valid dan sedang diproses",
		"data":    req,
	})
}
