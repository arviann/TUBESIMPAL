package config

import (
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	// ganti user:password sesuai MySQL kamu
	dsn := "root:mysql2025@tcp(127.0.0.1:3306)/tunetix_db?charset=utf8mb4&parseTime=True&loc=Local"

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal konek ke database:", err)
	}

	fmt.Println("✅ Database connected")
	DB = db
}
