package handlers

import (
	"net/http"

	"github.com/diegomesquita/ProjetoeCloudFiscal/backend/internal/config"
	"github.com/diegomesquita/ProjetoeCloudFiscal/backend/internal/models"
	"github.com/gin-gonic/gin"
)

// ------------ LOGIN ------------

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func LoginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JSON inválido"})
		return
	}

	db := config.GetDB()

	var user models.User
	if err := db.Where("email = ? AND password = ?", req.Email, req.Password).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email ou senha inválidos"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login realizado com sucesso",
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
		},
	})
}

// ------------ UPLOAD XML ------------

func GetPendingFiles(c *gin.Context) {
	db := config.GetDB()

	var files []models.XmlFile
	if err := db.Where("status = ?", "pending").Find(&files).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar arquivos pendentes"})
		return
	}

	c.JSON(http.StatusOK, files)
}

func UploadHandler(c *gin.Context) {
	var file models.XmlFile

	if err := c.ShouldBindJSON(&file); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JSON inválido"})
		return
	}

	file.Status = "pending"
	db := config.GetDB()
	if err := db.Create(&file).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar arquivo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Arquivo recebido com sucesso"})
}
