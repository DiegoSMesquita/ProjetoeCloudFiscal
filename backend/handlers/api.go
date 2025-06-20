package models

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetPendingFiles(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	var files []models.xmlfile
	db.Where("status = ?", "pending").Offset(offset).Limit(limit).Find(&files)

	c.JSON(200, files)
}
