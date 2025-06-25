package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/diegomesquita/ProjetoeCloudFiscal/backend/internal/config"
	"github.com/diegomesquita/ProjetoeCloudFiscal/backend/internal/handlers"
	"github.com/diegomesquita/ProjetoeCloudFiscal/backend/internal/models"
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
	fmt.Println("✅ Conectado ao Mysql!")

	// 4. Executar migrações
	if err := db.AutoMigrate(&models.User{}, &models.XmlFile{}); err != nil {
		log.Fatal("Erro ao Migrar as tabelas", err)
	}

	//	if err := models.RunMigrations(db); err != nil {
	//		log.Fatal("🚨 Erro nas migrações:", err)
	//	}
	//	fmt.Println("✅ Migrações executadas!")

	// 5. Configurar o servidor Gin
	router := gin.Default()
	router.Use(gin.Logger()) // Habilita logging das requisições

	// 6. Registrar rotas
	registerRoutes(router)

	// 7. Configurar porta
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// 8. Iniciar servidor
	fmt.Printf("\n🚀 Servidor rodando em http://localhost:%s\n\n", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

func registerRoutes(router *gin.Engine) {
	// Rotas públicas
	router.GET("/", homeHandler)
	router.GET("/health", healthHandler)
	router.GET("/api/files/pending", handlers.GetPendingFiles)

	// Rotas autenticadas
	authGroup := router.Group("/api/v1")
	authGroup.Use(authMiddleware())
	{
		authGroup.GET("/users", listUsersHandler)
		authGroup.POST("/upload", uploadHandler)
	}
}

// Handlers
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

// Middlewares
func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Token de acesso necessário",
			})
			return
		}
		// Implementar validação JWT aqui
		c.Next()
	}
}
