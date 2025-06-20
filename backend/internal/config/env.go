package config

import (
	"fmt"

	"github.com/joho/godotenv"
)

// LoadEnv carrega variáveis do arquivo .env
func LoadEnv() error {
	err := godotenv.Load()
	if err != nil {
		return fmt.Errorf("error loading .env file: %v", err)
	}
	return nil
}
