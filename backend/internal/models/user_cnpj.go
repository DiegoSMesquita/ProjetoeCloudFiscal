package models

import "time"

type UserCNPJ struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	CNPJ      string    `json:"cnpj"`
	NomeLoja  string    `json:"nome_loja"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
