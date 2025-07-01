package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/diegomesquita/ProjetoeCloudFiscal/backend/internal/config"
	"github.com/diegomesquita/ProjetoeCloudFiscal/backend/internal/handlers"
	"github.com/diegomesquita/ProjetoeCloudFiscal/backend/internal/models"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

var db *gorm.DB

func main() {
	// 1. Configuração inicial
	fmt.Println("🛠️  Iniciando servidor...")

	// 2. Carregar variáveis de ambiente
	if err := godotenv.Load(); err != nil {
		log.Fatal("🚨 Erro carregando .env:", err)
	}

	// 3. Conectar ao banco de dados
	var err error
	db, err = config.ConnectDB()
	if err != nil {
		log.Fatal("🚨 Erro na conexão com o banco:", err)
	}
	fmt.Println("✅ Conectado ao MySQL!")

	// 4. Executar migrações
	if err := db.AutoMigrate(&models.User{}, &models.XmlFile{}, &models.UserCNPJ{}); err != nil {
		log.Fatal("❌ Erro ao migrar as tabelas:", err)
	}

	// 5. Iniciar handlers com DB
	handlers.Init(db)

	// 6. Configurar servidor Gin
	router := gin.Default()
	router.Use(gin.Logger())

	// Middleware CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:8080"},
		AllowMethods:     []string{"POST", "GET", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// 7. Registrar rotas
	registerRoutes(router)
	// Rota de login admin
	router.POST("/api/admin/login", handlers.AdminLoginGinHandler)

	// 8. Configurar porta
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// 9. Iniciar servidor
	fmt.Printf("\n🚀 Servidor rodando em http://localhost:%s\n\n", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

// 🔓 Rotas públicas
func registerRoutes(router *gin.Engine) {
	router.GET("/", homeHandler)
	router.GET("/health", healthHandler)
	router.GET("/api/files/pending", handlers.GetPendingFiles)
	router.POST("/api/login", handlers.LoginHandler) // ✅ aqui
	router.POST("/api/xmls/upload", handlers.UploadXmlHandler)
	router.POST("/api/xmls/send", handlers.SendXmlsHandler)
	router.POST("/api/xmls/export/excel", handlers.ExportExcelHandler)
	router.POST("/api/xmls/export/pdf", handlers.ExportPdfHandler)
	router.POST("/api/xmls/delete", handlers.DeleteXmlsHandler)

	authGroup := router.Group("/api/v1")
	authGroup.Use(authMiddleware())
	{
		authGroup.GET("/users", listUsersHandler)
		authGroup.POST("/upload", uploadHandler)
	}
}

// Handlers simples
func homeHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Bem-vindo à API eCloudFiscal",
		"version": "1.0.0",
	})
}

func healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":   "ok",
		"database": "connected",
	})
}

func listUsersHandler(c *gin.Context) {
	var users []models.User
	if err := db.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Falha ao buscar usuários",
		})
		return
	}
	c.JSON(http.StatusOK, users)
}

func uploadHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "received",
		"message": "Upload em processamento",
	})
}

// Middleware fictício (JWT no futuro)
func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Token de acesso necessário",
			})
			return
		}
		c.Next()
	}
}
