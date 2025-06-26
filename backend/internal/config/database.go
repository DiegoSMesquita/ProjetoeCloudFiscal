package config

import (
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var db *gorm.DB

func ConnectDB() (*gorm.DB, error) {
	dsn := os.Getenv("DB_USER") + ":" +
		os.Getenv("DB_PASSWORD") + "@tcp(" +
		os.Getenv("DB_HOST") + ":" +
		os.Getenv("DB_PORT") + ")/" +
		os.Getenv("DB_NAME") + "?charset=utf8mb4&parseTime=True&loc=Local"

	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	db = database
	return db, nil
}

// ✅ Esta função precisa ser adicionada:
func GetDB() *gorm.DB {
	if db == nil {
		log.Fatal("❌ Banco de dados ainda não conectado. Chame ConnectDB() primeiro.")
	}
	return db
}
