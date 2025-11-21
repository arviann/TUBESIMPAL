package config

import (
	"fmt"
	"log"
	"tubesimpal-backend/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	dsn := "root:mysql2025@tcp(127.0.0.1:3306)/tunetix_db?charset=utf8mb4&parseTime=True&loc=Local"

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal konek ke database:", err)
	}

	// ⬇️ MIGRATE semua tabel yang kita pakai
	if err := db.AutoMigrate(
		&models.User{},
		&models.Event{},
		&models.TicketType{},
		&models.Order{},
		&models.OrderItem{},
	); err != nil {
		log.Fatal("Gagal migrate database:", err)
	}

	fmt.Println("✅ Database connected")
	DB = db
}
