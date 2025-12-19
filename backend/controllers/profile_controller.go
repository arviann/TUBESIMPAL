package controllers

import (
	"net/http"
	"strconv"

	"tubesimpal-backend/config"
	"tubesimpal-backend/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// ================= GET PROFILE =================

// GET /profile?user_id=1
func GetProfile(c *gin.Context) {
	db := config.DB

	userIDStr := c.Query("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "user_id wajib diisi",
		})
		return
	}

	uid, err := strconv.Atoi(userIDStr)
	if err != nil || uid <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "user_id tidak valid",
		})
		return
	}

	var user models.User
	if err := db.First(&user, uid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	})
}

// ================= UPDATE PROFILE =================

type UpdateProfileRequest struct {
	UserID int    `json:"user_id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
}

// PUT /profile
func UpdateProfile(c *gin.Context) {
	db := config.DB

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Format JSON tidak valid",
		})
		return
	}

	// validasi manual
	if req.UserID <= 0 || req.Name == "" || req.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Field wajib tidak boleh kosong",
		})
		return
	}

	var user models.User
	if err := db.First(&user, req.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User tidak ditemukan",
		})
		return
	}

	user.Name = req.Name
	user.Email = req.Email

	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal update profile",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Profil berhasil diperbarui",
	})
}

// ================= CHANGE PASSWORD =================

type ChangePasswordRequest struct {
	UserID      int    `json:"user_id"`
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

// PUT /profile/password
func ChangePassword(c *gin.Context) {
	db := config.DB

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Format JSON tidak valid",
		})
		return
	}

	// validasi manual
	if req.UserID <= 0 || req.OldPassword == "" || req.NewPassword == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Field wajib tidak boleh kosong",
		})
		return
	}

	if len(req.NewPassword) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Password baru minimal 8 karakter",
		})
		return
	}

	var user models.User
	if err := db.First(&user, req.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User tidak ditemukan",
		})
		return
	}

	// cek password lama
	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(req.OldPassword),
	); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Password lama salah",
		})
		return
	}

	// hash password baru
	hashed, err := bcrypt.GenerateFromPassword(
		[]byte(req.NewPassword),
		bcrypt.DefaultCost,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal memproses password",
		})
		return
	}

	user.Password = string(hashed)
	db.Save(&user)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password berhasil diganti",
	})
}
