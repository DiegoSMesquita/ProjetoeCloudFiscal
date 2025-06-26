package handlers

import (
	"gorm.io/gorm"
)

var db *gorm.DB

// Init conecta o handler ao banco
func Init(database *gorm.DB) {
	db = database
}

// LoginPayload representa o corpo da requisição de login
type LoginPayload struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}
