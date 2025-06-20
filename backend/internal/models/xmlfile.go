package models

import (
	"time"

	"github.com/google/uuid"
)

type XMLFile struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey"`
	UserID     uuid.UUID
	CNPJ       string    `gorm:"index;not null"`
	FileName   string    `gorm:"uniqueIndex;not null"`
	Checksum   string    `gorm:"uniqueIndex;not null"`
	ModelType  string    `gorm:"index;not null"`
	UploadedAt time.Time `gorm:"index"`
	FileSize   int64
	Status     string `gorm:"default:'pending'"`
}
