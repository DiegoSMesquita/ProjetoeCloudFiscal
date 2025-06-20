package models_test

import (
	"testing"

	"github.com/ecloudfiscal/backend/internal/config"
	"github.com/ecloudfiscal/backend/internal/models"
	"github.com/stretchr/testify/assert"
)

func TestRunMigrations(t *testing.T) {
	// Setup
	db, _ := config.ConnectDB()
	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	// Limpa o banco antes do teste
	//	_ = sqlDB.Exec("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")

	t.Run("Migrações devem ser executadas sem erros", func(t *testing.T) {
		err := models.RunMigrations(db)
		assert.NoError(t, err)

		// Verifica se tabelas foram criadas
		assert.True(t, db.Migrator().HasTable(&models.User{}))
		assert.True(t, db.Migrator().HasTable(&models.XMLFile{}))
	})
}
