package models_test

import (
	"testing"

	"github.com/ecloudfiscal/backend/internal/config"
	"github.com/ecloudfiscal/backend/internal/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func TestModels(t *testing.T) {
	db := setupTestDB(t)

	t.Run("Criação de User", func(t *testing.T) {
		user := models.User{
			Email:        "test@ecloudfiscal.com",
			PasswordHash: "hash_seguro",
		}

		err := db.Create(&user).Error
		assert.NoError(t, err)
		assert.NotEqual(t, uuid.Nil, user.ID)
	})

	t.Run("Criação de XMLFile", func(t *testing.T) {
		user := models.User{Email: "xml@test.com", PasswordHash: "hash"}
		db.Create(&user)

		xmlFile := models.XMLFile{
			UserID:    user.ID,
			FileName:  "nota.xml",
			Checksum:  "abc123",
			ModelType: "NF-e",
		}

		err := db.Create(&xmlFile).Error
		assert.NoError(t, err)
	})
}

func setupTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, _ := config.ConnectDB()
	db.Exec("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
	models.RunMigrations(db)
	return db
}
