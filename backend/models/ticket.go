package models

// TicketOrderRequest merepresentasikan Form Pemesanan Tiket
type TicketOrderRequest struct {
	JumlahTiket   int    `json:"jumlahTiket" binding:"required,gt=0"`
	ZonaKursi     string `json:"zonaKursi" binding:"required"`
	TanggalKonser string `json:"tanggalKonser" binding:"required"`
	NamaEvent     string `json:"namaEvent" binding:"required"`
}
