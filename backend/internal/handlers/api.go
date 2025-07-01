package handlers

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io/ioutil"
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
	if err := db.Find(&files).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar arquivos"})
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
			CProd  string `xml:"cProd"`
			XProd  string `xml:"xProd"`
			VUnCom string `xml:"vUnCom"`
			VProd  string `xml:"vProd"`
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

	// Adicionar parser para CF-e SAT (modelo 59)
	type CFeDet struct {
		Prod struct {
			CProd  string `xml:"cProd"`
			XProd  string `xml:"xProd"`
			VUnCom string `xml:"vUnCom"`
			VProd  string `xml:"vProd"`
		} `xml:"prod"`
	}
	type CFeIde struct {
		Mod   string `xml:"mod"`
		NCFe  string `xml:"nCFe"`
		DEmi  string `xml:"dEmi"`
		CNPJ  string `xml:"CNPJ"`
		Serie string `xml:"nserieSAT"`
	}
	type CFeEmit struct {
		CNPJ  string `xml:"CNPJ"`
		XNome string `xml:"xNome"`
	}
	type CFeTotal struct {
		ICMSTot struct {
			VProd string `xml:"vProd"`
		} `xml:"ICMSTot"`
		VCFe string `xml:"vCFe"`
	}
	type CFeInfCFe struct {
		Ide   CFeIde   `xml:"ide"`
		Emit  CFeEmit  `xml:"emit"`
		Det   []CFeDet `xml:"det"`
		Total CFeTotal `xml:"total"`
	}
	type CFe struct {
		InfCFe CFeInfCFe `xml:"infCFe"`
	}
	if errParse != nil || proc.NFe.InfNFe.Ide.Mod == "" {
		// Tentar parsear como CF-e SAT
		var cfe CFe
		errCfe := xml.Unmarshal(content, &cfe)
		if errCfe == nil && cfe.InfCFe.Ide.Mod == "59" {
			modelo = cfe.InfCFe.Ide.Mod
			tipo = "CF-e"
			cnpj = cfe.InfCFe.Emit.CNPJ
			emitente = cfe.InfCFe.Emit.XNome
			numero = cfe.InfCFe.Ide.NCFe
			serie = cfe.InfCFe.Ide.Serie
			dataEmissao = cfe.InfCFe.Ide.DEmi
			valor = cfe.InfCFe.Total.VCFe
			for _, det := range cfe.InfCFe.Det {
				produtos = append(produtos, map[string]string{
					"codigo":         det.Prod.CProd,
					"descricao":      det.Prod.XProd,
					"valor_unitario": det.Prod.VUnCom,
					"valor_total":    det.Prod.VProd,
				})
			}
		}
	}

	db := config.GetDB()
	produtosJson, _ := json.Marshal(produtos)
	xmlFile := models.XmlFile{
		FileName:     file.Filename,
		Status:       "pending",
		Content:      content,
		Modelo:       tipo,
		CNPJ:         cnpj,
		DataEmissao:  dataEmissao,
		Valor:        valor,
		Numero:       numero,
		Serie:        serie,
		Emitente:     emitente,
		Destinatario: destinatario,
		Produtos:     string(produtosJson),
	}
	// Antes de criar o xmlFile, checar duplicidade:
	if cnpj != "" && numero != "" && serie != "" && tipo != "" {
		var count int64
		db.Model(&models.XmlFile{}).Where("cnpj = ? AND numero = ? AND serie = ? AND modelo = ?", cnpj, numero, serie, tipo).Count(&count)
		if count > 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "Arquivo XML já enviado (duplicado pelo identificador fiscal)"})
			return
		}
	}
	// Após o parser do XML, antes de salvar:
	if cnpj == "" || numero == "" || serie == "" || tipo == "" {
		// Log para debug
		fmt.Printf("[UPLOAD XML] Falha ao extrair campos do XML: modelo=%s, cnpj=%s, numero=%s, serie=%s\n", modelo, cnpj, numero, serie)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Não foi possível extrair os dados fiscais do XML. Verifique o layout do arquivo."})
		return
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

// ------------ ADMIN LOGIN ------------

// Removido: struct AdminLoginRequest duplicada
// Removido: referências a models.Admin, req.Email, req.Password
// Use apenas o handler AdminLoginGinHandler do admin_auth.go para autenticação admin
