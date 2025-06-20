package models

import (
	"fmt"
	"io/ioutil"
	"strings"

	"gorm.io/gorm"
)

func RunMigrations(db *gorm.DB) error {
	// Auto-migrate dos modelos
	err := db.AutoMigrate(&User{}, &XMLFile{})
	if err != nil {
		return fmt.Errorf("falha na automigração: %v", err)
	}

	// Executar migrações SQL
	migrationFiles := []string{
		"migrations/001_create_users_table.up.sql",
		"migrations/002_create_xml_files_table.up.sql",
	}

	for _, file := range migrationFiles {
		content, err := ioutil.ReadFile(file)
		if err != nil {
			return fmt.Errorf("erro lendo migração %s: %v", file, err)
		}

		err = db.Exec(string(content)).Error
		if err != nil && !strings.Contains(err.Error(), "already exists") {
			return fmt.Errorf("erro executando migração %s: %v", file, err)
		}
	}

	return nil
}
