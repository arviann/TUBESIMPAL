package models

import "time"

// ==== FORM VALIDATION UNTUK PAYMENT ====

type PaymentRequest struct {
	MetodePembayaran string `json:"metodePembayaran"`
	Nominal          int    `json:"nominal"`
}

// ==== MODEL DB UNTUK TUNETIX ====

type Order struct {
	ID          uint      `gorm:"primaryKey" json:"order_id"`
	UserID      uint      `gorm:"column:user_id" json:"user_id"`
	EventID     uint      `gorm:"column:event_id" json:"event_id"`
	TotalAmount int       `gorm:"column:total_amount" json:"total_amount"`
	Status      string    `json:"status"` // PENDING / PAID / CANCELLED
	CreatedAt   time.Time `gorm:"column:created_at" json:"created_at"`

	// relasi ke order_items
	Items []OrderItem `gorm:"foreignKey:OrderID" json:"items"`

	// relasi ke event
	Event Event `json:"event,omitempty"`
}

type OrderItem struct {
	ID           uint `gorm:"primaryKey" json:"id"`
	OrderID      uint `gorm:"column:order_id" json:"order_id"`
	TicketTypeID uint `gorm:"column:ticket_type_id" json:"ticket_type_id"`
	Quantity     int  `json:"quantity"`
	UnitPrice    int  `gorm:"column:unit_price" json:"unit_price"`
	Subtotal     int  `json:"subtotal"`

	// relasi ke ticket_types
	TicketType TicketType `json:"ticket_type,omitempty"`
}
