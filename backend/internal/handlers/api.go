package handlers

import (
	"encoding/xml"
	"io/ioutil"
	"net/http"
	"strings"

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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	db := config.GetDB()
	var user models.User
	if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário ou senha inválidos"})
		return
	}

	if user.Password != req.Password {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário ou senha inválidos"})
		return
	}

	var cnpjs []models.UserCNPJ
	db.Where("user_id = ?", user.ID).Find(&cnpjs)

	c.JSON(http.StatusOK, gin.H{
		"user_id": user.ID,
		"email":   user.Email,
		"cnpjs":   cnpjs,
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

func UploadXmlHandler(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Arquivo não enviado"})
		return
	}
	opened, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao abrir arquivo"})
		return
	}
	defer opened.Close()
	content, err := ioutil.ReadAll(opened)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao ler arquivo"})
		return
	}

	type Det struct {
		Prod struct {
			CProd      string `xml:"cProd"`
			XProd      string `xml:"xProd"`
			VUnCom     string `xml:"vUnCom"`
			VProd      string `xml:"vProd"`
		} `xml:"prod"`
	}
	type InfNFe struct {
		Ide struct {
			Mod   string `xml:"mod"`
			DhEmi string `xml:"dhEmi"`
			DEmi  string `xml:"dEmi"`
			NNF   string `xml:"nNF"`
			Serie string `xml:"serie"`
		} `xml:"ide"`
		Emit struct {
			CNPJ  string `xml:"CNPJ"`
			XNome string `xml:"xNome"`
		} `xml:"emit"`
		Dest struct {
			CNPJ  string `xml:"CNPJ"`
			XNome string `xml:"xNome"`
		} `xml:"dest"`
		Total struct {
			ICMSTot struct {
				VNF string `xml:"vNF"`
			} `xml:"ICMSTot"`
		} `xml:"total"`
		Det []Det `xml:"det"`
	}
	type NFe struct {
		InfNFe InfNFe `xml:"infNFe"`
	}
	type NFeProc struct {
		NFe NFe `xml:"NFe"`
	}

	var modelo, cnpj, dataEmissao, valor, numero, serie, emitente, destinatario string
	var produtos []map[string]string
	var tipo string

	var proc NFeProc
	errParse := xml.Unmarshal(content, &proc)
	if errParse == nil && proc.NFe.InfNFe.Ide.Mod != "" {
		modelo = proc.NFe.InfNFe.Ide.Mod
		cnpj = proc.NFe.InfNFe.Emit.CNPJ
		emitente = proc.NFe.InfNFe.Emit.XNome
		destinatario = proc.NFe.InfNFe.Dest.XNome
		if proc.NFe.InfNFe.Ide.DhEmi != "" {
			dataEmissao = proc.NFe.InfNFe.Ide.DhEmi
		} else {
			dataEmissao = proc.NFe.InfNFe.Ide.DEmi
		}
		valor = proc.NFe.InfNFe.Total.ICMSTot.VNF
		numero = proc.NFe.InfNFe.Ide.NNF
		serie = proc.NFe.InfNFe.Ide.Serie
		for _, det := range proc.NFe.InfNFe.Det {
			produtos = append(produtos, map[string]string{
				"codigo":         det.Prod.CProd,
				"descricao":      det.Prod.XProd,
				"valor_unitario": det.Prod.VUnCom,
				"valor_total":    det.Prod.VProd,
			})
		}
		if modelo == "55" {
			tipo = "NFE"
		} else if modelo == "65" {
			tipo = "NFC-e"
		} else if modelo == "59" {
			tipo = "CF-e"
		} else {
			tipo = modelo
		}
	}
	// TODO: Adicionar parse para NFS-e se necessário

	db := config.GetDB()
	xmlFile := models.XmlFile{
		FileName:      file.Filename,
		Status:        "pending",
		Content:       content,
		Modelo:        tipo,
		CNPJ:          cnpj,
		DataEmissao:  dataEmissao,
		Valor:         valor,
		Numero:        numero,
		Serie:         serie,
		Emitente:      emitente,
		Destinatario: destinatario,
		Produtos:      produtos,
	}
	if err := db.Create(&xmlFile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar arquivo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Upload realizado com sucesso!"})
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
	var files []models.XmlFile
	if err := db.Where("id IN ?", req.IDs).Find(&files).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar arquivos"})
		return
	}
	// Aqui você pode zipar os arquivos e enviar por e-mail usando net/smtp ou outra lib
	c.JSON(http.StatusOK, gin.H{"message": "E-mail enviado com sucesso!"})
}

type ExportRequest struct {
	IDs []string `json:"ids"`
}

func ExportExcelHandler(c *gin.Context) {
	var req ExportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}
	// Buscar arquivos, gerar Excel e retornar como attachment
	// ...
}

func ExportPdfHandler(c *gin.Context) {
	var req ExportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}
	// Buscar arquivos, gerar PDF e retornar como attachment
	// ...
}

// Endpoint para deletar arquivos XML
func DeleteXmlsHandler(c *gin.Context) {
	type DeleteRequest struct {
		IDs []string `json:"ids"`
	}
	var req DeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}
	db := config.GetDB()
	if err := db.Where("id IN ?", req.IDs).Delete(&models.XmlFile{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar arquivos"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Arquivos excluídos com sucesso!"})
}
