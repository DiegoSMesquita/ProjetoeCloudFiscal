package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/diegomesquita/ProjetoeCloudFiscal/backend/internal/models"
)

// Health check para verificar se o servidor está de pé
func Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// Rota para retornar arquivos com status pendente (paginado)
func GetPendingFiles(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	var files []models.XmlFile
	result := db.Where("status = ?", "pending").Offset(offset).Limit(limit).Find(&files)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, files)
}

// Registro de todas as rotas
func RegisterRoutes(r *gin.Engine) {
	r.GET("/health", Health)
	r.GET("/api/files/pending", GetPendingFiles)
}
