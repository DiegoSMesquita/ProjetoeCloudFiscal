package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        string `gorm:"type:char(36);primaryKey"`
	Email     string `gorm:"type:varchar(191);uniqueIndex;not null"`
	Password  string `gorm:"type:varchar(255);not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	u.ID = uuid.New().String()
	return nil
}

type XmlFile struct {
	ID        string `gorm:"type:char(36);primaryKey"`
	UserID    string `gorm:"type:char(36);not null;index"`
	FileName  string `gorm:"not null"`
	Status    string `gorm:"type:enum('pending','sent','error');default:'pending'"`
	SentAt    *time.Time
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (f *XmlFile) BeforeCreate(tx *gorm.DB) error {
	f.ID = uuid.New().String()
	return nil
}
