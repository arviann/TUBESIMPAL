package controllers

import (
	"errors"
	"net/http"
	"strings"

	"tubesimpal-backend/config"
	"tubesimpal-backend/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// REGISTER: POST /auth/register
func Register(c *gin.Context) {
	var req models.RegisterRequest

	// validasi body
	if err := c.ShouldBindJSON(&req); err != nil {
		errorsResp := validationErrorsToResponse(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"errors":  errorsResp,
		})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))

	// cek apakah email sudah dipakai
	var existing models.User
	if err := config.DB.Where("email = ?", email).First(&existing).Error; err == nil {
		// ketemu user → email sudah terdaftar
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"errors": []map[string]string{{
				"field":   "email",
				"message": "Email sudah terdaftar",
			}},
		})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		// error lain
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
		return
	}

	// hash password
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal memproses password",
		})
		return
	}

	user := models.User{
		Name:     strings.TrimSpace(req.Name),
		Email:    email,
		Password: string(hashed),
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal menyimpan user",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Registrasi berhasil",
		"data": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	})
}

// LOGIN: POST /auth/login
func Login(c *gin.Context) {
	var req models.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		errorsResp := validationErrorsToResponse(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"errors":  errorsResp,
		})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))

	var user models.User
	if err := config.DB.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// user tidak ditemukan
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Email atau password salah",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
		return
	}

	// bandingkan password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Email atau password salah",
		})
		return
	}

	// untuk sekarang belum pakai JWT, cukup return success
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Login berhasil",
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	})
}
