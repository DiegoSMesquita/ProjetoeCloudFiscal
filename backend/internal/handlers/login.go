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

// LoginHandler faz autenticação e retorna os CNPJs do usuário
// func LoginHandler(c *gin.Context) {
//	var payload LoginPayload
//	if err := c.ShouldBindJSON(&payload); err != nil {
//		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
//		return
//	}

//	var user models.User
//	if err := db.Where("email = ?", payload.Email).First(&user).Error; err != nil {
//		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário ou senha inválidos"})
//		return
//	}

// Comparação simples de senha (ajuste para hash se necessário)
//	if user.Password != payload.Password {
//		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário ou senha inválidos"})
//		return
//	}

// Buscar CNPJs do usuário
//	var cnpjs []models.UserCNPJ
//	db.Where("user_id = ?", user.ID).Find(&cnpjs)

//	c.JSON(http.StatusOK, gin.H{
//		"user_id": user.ID,
//		"email":   user.Email,
//		"cnpjs":   cnpjs,
//	})
//}
