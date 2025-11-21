package models

import "time"

// ==== FORM VALIDATION YANG LAMA (tetap dipakai) ====

type PaymentRequest struct {
	NomorKartu       string  `json:"nomorKartu" binding:"required,numeric,min=16,max=19"`
	Nominal          float64 `json:"nominal" binding:"required,gt=0"`
	MetodePembayaran string  `json:"metodePembayaran" binding:"required,oneof=CASH TRANSFER E_WALLET"`
	CVV              string  `json:"cvv" binding:"required,numeric,len=3"`
}

// ==== MODEL DB UNTUK TUNETIX ====

type Order struct {
	ID          uint        `gorm:"primaryKey" json:"order_id"`
	UserID      uint        `gorm:"column:user_id" json:"user_id"`
	TotalAmount int         `gorm:"column:total_amount" json:"total_amount"`
	Status      string      `json:"status"` // PENDING / PAID / CANCELLED
	CreatedAt   time.Time   `gorm:"column:created_at" json:"created_at"`
	Items       []OrderItem `gorm:"foreignKey:OrderID" json:"items"`
}

type OrderItem struct {
	ID           uint `gorm:"primaryKey" json:"id"`
	OrderID      uint `gorm:"column:order_id" json:"order_id"`
	TicketTypeID uint `gorm:"column:ticket_type_id" json:"ticket_type_id"`
	Quantity     int  `json:"quantity"`
	UnitPrice    int  `gorm:"column:unit_price" json:"unit_price"`
	Subtotal     int  `json:"subtotal"`
}
