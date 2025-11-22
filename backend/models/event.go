package models

import "time"

// mapping ke tabel "events"
type Event struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	City        string    `json:"city"`
	Location    string    `json:"location"`
	StartDate   time.Time `gorm:"column:start_date" json:"start_date"`
	EndDate     time.Time `gorm:"column:end_date" json:"end_date"`
	ImageURL    string    `gorm:"column:image_url" json:"image_url"`
	Category    string    `json:"category"`
	CreatedAt   time.Time `gorm:"column:created_at" json:"created_at"`

	// relasi: satu event punya banyak ticket types
	TicketTypes []TicketType `gorm:"foreignKey:EventID" json:"ticket_types,omitempty"`
}

// mapping ke tabel "ticket_types"
type TicketType struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	EventID     uint   `gorm:"column:event_id" json:"event_id"`
	Name        string `json:"name"` // REGULER / VIP / VVIP
	Price       int    `json:"price"`
	Quota       *int   `json:"quota,omitempty"`
	Description string `json:"description"`
}
