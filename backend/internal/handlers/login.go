package handlers

import (
	"net/http"

	"github.com/diegomesquita/ProjetoeCloudFiscal/backend/internal/models"
	"github.com/gin-gonic/gin"
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

// LoginHandler lida com a autenticação
func LoginHandler(c *gin.Context) {
	var payload LoginPayload

	// Validação de entrada
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email e senha são obrigatórios"})
		return
	}

	var user models.User

	// Buscar usuário pelo email
	if err := db.Where("email = ?", payload.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não encontrado"})
		return
	}

	// Verificar senha (aqui compara direto, ideal é usar hash)
	if payload.Password != user.Password {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Senha incorreta"})
		return
	}

	// Sucesso
	c.JSON(http.StatusOK, gin.H{
		"message": "Login realizado com sucesso",
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
		},
	})
}
