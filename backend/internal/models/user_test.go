package models_test

import (
	"testing"

	"github.com/ecloudfiscal/backend/internal/config"
	"github.com/ecloudfiscal/backend/internal/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestUserModel(t *testing.T) {
	db, _ := config.ConnectDB()
	db.AutoMigrate(&models.User{})

	t.Run("Create valid user", func(t *testing.T) {
		user := models.User{
			Email:        "test@example.com",
			PasswordHash: "securehash",
		}

		result := db.Create(&user)
		assert.NoError(t, result.Error)
		assert.NotEqual(t, uuid.Nil, user.ID)
	})
}
