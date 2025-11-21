package controllers

import (
	"net/http"
	"regexp"
	"strings"
	"time"

	"tubesimpal-backend/models"

	"github.com/gin-gonic/gin"
)

// zona kursi yang diizinkan (contoh, sesuaikan dengan app kamu)
var allowedZones = []string{"A", "B", "C", "VIP", "REGULER"}

// cek apakah zona valid
func isAllowedZone(z string) bool {
	z = strings.ToUpper(strings.TrimSpace(z))
	for _, v := range allowedZones {
		if z == v {
			return true
		}
	}
	return false
}

// nama event hanya boleh huruf, angka, dan spasi
var eventNameRegexp = regexp.MustCompile(`^[a-zA-Z0-9 ]+$`)

// CreateTicketOrder menangani POST /tickets/order
func CreateTicketOrder(c *gin.Context) {
	var req models.TicketOrderRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		errors := validationErrorsToResponse(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"errors":  errors,
		})
		return
	}

	// Cek zona kursi
	if !isAllowedZone(req.ZonaKursi) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"errors": []map[string]string{{
				"field":   "zonaKursi",
				"message": "Zona tempat duduk tidak ditemukan",
			}},
		})
		return
	}

	// Cek format tanggal: YYYY-MM-DD (misalnya: 2025-11-21)
	if _, err := time.Parse("2006-01-02", req.TanggalKonser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"errors": []map[string]string{{
				"field":   "tanggalKonser",
				"message": "Format tanggal salah (gunakan YYYY-MM-DD)",
			}},
		})
		return
	}

	// Cek nama event (hanya huruf, angka, dan spasi)
	if !eventNameRegexp.MatchString(req.NamaEvent) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"errors": []map[string]string{{
				"field":   "namaEvent",
				"message": "Nama event hanya boleh huruf, angka, dan spasi",
			}},
		})
		return
	}

	// Kalau semua lolos → sukses
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pemesanan tiket valid dan sedang diproses",
		"data":    req,
	})
}
