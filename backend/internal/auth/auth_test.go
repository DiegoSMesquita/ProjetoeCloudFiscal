package auth_test

import (
	"testing"
	"time"

	"github.com/ecloudfiscal/backend/internal/auth"
	"github.com/stretchr/testify/assert"
)

func TestPasswordHashing(t *testing.T) {
	t.Parallel()

	password := "senhaSuperSegura123"
	hash, err := auth.HashPassword(password)
	assert.NoError(t, err)
	assert.NotEmpty(t, hash)

	t.Run("Verificar senha correta", func(t *testing.T) {
		assert.True(t, auth.CheckPasswordHash(password, hash))
	})

	t.Run("Verificar senha incorreta", func(t *testing.T) {
		assert.False(t, auth.CheckPasswordHash("senhaErrada", hash))
	})
}

func TestJWTGeneration(t *testing.T) {
	t.Parallel()

	userID := "550e8400-e29b-41d4-a716-446655440000"
	token, err := auth.GenerateJWT(userID)
	assert.NoError(t, err)
	assert.NotEmpty(t, token)

	t.Run("Validar token gerado", func(t *testing.T) {
		claims, err := auth.ValidateJWT(token)
		assert.NoError(t, err)
		assert.Equal(t, userID, claims.Subject)
		assert.WithinDuration(t, time.Now().Add(auth.JWTExpiration), claims.ExpiresAt.Time, 10*time.Second)
	})
}