package models

// PaymentRequest merepresentasikan body JSON Form Pembayaran
type PaymentRequest struct {
	NomorKartu       string  `json:"nomorKartu" binding:"required,min=16,max=19"`      // hanya angka, tanpa '-'
	Nominal          float64 `json:"nominal" binding:"required,gt=0"`                  // > 0
	MetodePembayaran string  `json:"metodePembayaran" binding:"required,oneof=CASH TRANSFER E_WALLET"`
	CVV              string  `json:"cvv" binding:"required,len=3"`                     // 3 karakter
}
