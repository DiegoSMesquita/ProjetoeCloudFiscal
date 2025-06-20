package config_test

import (
    "testing"
    "github.com/ecloudfiscal/backend/internal/config"
    "github.com/stretchr/testify/require"
)

func TestDatabaseConnection(t *testing.T) {
    t.Setenv("DB_HOST", "localhost")
    t.Setenv("DB_PORT", "5432")
    t.Setenv("DB_USER", "postgres")
    t.Setenv("DB_PASSWORD", "secret")
    t.Setenv("DB_NAME", "ecloudfiscal_test")
    t.Setenv("SSL_MODE", "disable")

    db, err := config.ConnectDB()
    require.NoError(t, err)
    
    sqlDB, err := db.DB()
    require.NoError(t, err)
    
    err = sqlDB.Ping()
    require.NoError(t, err)
}