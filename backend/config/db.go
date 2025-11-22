package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"tubesimpal-backend/models"
)

var DB *gorm.DB

func ConnectDatabase() {
	// Load .env (gak fatal kalau gagal, karena di server pakai env dari OS)
	godotenv.Load()

	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	// Validasi minimal
	if dbHost == "" || dbUser == "" || dbName == "" {
		log.Fatal("❌ ENV DATABASE belum lengkap. Pastikan DB_HOST, DB_USER, DB_NAME sudah diisi.")
	}

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPass, dbHost, dbPort, dbName,
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Gagal konek database:", err)
	}

	// Auto Migrasi DB
	if err := db.AutoMigrate(
		&models.User{},
		&models.Event{},
		&models.TicketType{},
		&models.Order{},
		&models.OrderItem{},
	); err != nil {
		log.Fatal("❌ Gagal AutoMigrate:", err)
	}

	fmt.Println("✅ Database Connected:", dbName)
	DB = db
}
