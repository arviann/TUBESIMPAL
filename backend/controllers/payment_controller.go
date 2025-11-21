package controllers

import (
	"net/http"
	"tubesimpal-backend/models"

	"github.com/gin-gonic/gin"
)

// helper: format error validasi jadi {field, message}
func validationErrorsToResponse(err error) []map[string]string {
	errors := []map[string]string{}

	errors = append(errors, map[string]string{
		"field":   "-",
		"message": err.Error(),
	})

	return errors
}

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

	// TODO: nanti bisa:
	// - cek nomor kartu lebih lanjut (algoritma Luhn)
	// - simpan transaksi ke DB lewat config.DB
	// - panggil payment gateway dummy

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pembayaran valid dan sedang diproses",
	})
}
