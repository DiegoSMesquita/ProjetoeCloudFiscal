package handlers

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"github.com/golang-jwt/jwt/v5"
)

type AdminLoginRequest struct {
	Usuario string `json:"usuario"`
	Senha   string `json:"senha"`
}

type AdminClaims struct {
	Usuario string `json:"usuario"`
	jwt.RegisteredClaims
}

// Exemplo didático: admin hardcoded, mas senha já está em hash bcrypt
var adminUser = "admin"
// Senha: admin123 (hash gerado por bcrypt)
var adminHash = "$2a$10$FuHYauq9F1L6BuMOfPyQdu3kzWYForK.c9ThaZRoIsjvrcc11Wk6i" // Substitua por hash real

func AdminLoginGinHandler(c *gin.Context) {
	var req AdminLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}
	// Busca admin (exemplo: hardcoded, mas pode ser do banco)
	if req.Usuario != adminUser {
		time.Sleep(1 * time.Second) // Protege contra brute force
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário ou senha inválidos"})
		return
	}
	// Compara senha usando bcrypt
	err := bcrypt.CompareHashAndPassword([]byte(adminHash), []byte(req.Senha))
	if err != nil {
		time.Sleep(1 * time.Second)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário ou senha inválidos"})
		return
	}
	// Gera JWT
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "segredo-super-seguro" // fallback
	}
	claims := AdminClaims{
		Usuario: req.Usuario,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}
