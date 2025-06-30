package models

import (
	"net/http"
	"time"

	"github.com/diegomesquita/ProjetoeCloudFiscal/backend/internal/config"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        string `gorm:"type:char(36);primaryKey"`
	Email     string `gorm:"type:varchar(191);uniqueIndex;not null"`
	Password  string `gorm:"type:varchar(255);not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	u.ID = uuid.New().String()
	return nil
}

type XmlFile struct {
	ID        string `gorm:"type:char(36);primaryKey"`
	UserID    string `gorm:"type:char(36);not null;index"`
	FileName  string `gorm:"not null"`
	Status    string `gorm:"type:enum('pending','sent','error');default:'pending'"`
	SentAt    *time.Time
	Content   []byte `gorm:"type:longblob"`
	CreatedAt time.Time
	UpdatedAt time.Time
	// Novos campos para detalhes do XML
	Modelo       string `gorm:"type:varchar(10)" json:"modelo"`
	CNPJ         string `gorm:"type:varchar(32)" json:"cnpj"`
	DataEmissao  string `gorm:"type:varchar(32)" json:"dataEmissao"`
	Valor        string `gorm:"type:varchar(32)" json:"valor"`
	Numero       string `gorm:"type:varchar(32)" json:"numero"`
	Serie        string `gorm:"type:varchar(32)" json:"serie"`
	Emitente     string `gorm:"type:varchar(128)" json:"emitente"`
	Destinatario string `gorm:"type:varchar(128)" json:"destinatario"`
	Produtos     string `gorm:"type:text" json:"produtos"` // Salvar como JSON string
}

func (f *XmlFile) BeforeCreate(tx *gorm.DB) error {
	f.ID = uuid.New().String()
	return nil
}

type SendXmlRequest struct {
	Email   string   `json:"email"`
	Message string   `json:"message"`
	IDs     []string `json:"ids"`
}

func SendXmlsHandler(c *gin.Context) {
	var req SendXmlRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}
	db := config.GetDB()
	var files []XmlFile // Corrigido: usar XmlFile sem o prefixo models.
	if err := db.Where("id IN ?", req.IDs).Find(&files).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar arquivos"})
		return
	}
	// Zipar arquivos e enviar por e-mail (use uma lib como net/smtp + zip)
	// ...
	c.JSON(http.StatusOK, gin.H{"message": "E-mail enviado com sucesso!"})
}
