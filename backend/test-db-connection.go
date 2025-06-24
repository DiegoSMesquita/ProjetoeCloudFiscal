package main

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", user, pass, host, port, dbname)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		panic("Erro ao montar DSN: " + err.Error())
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		panic("❌ Conexão falhou: " + err.Error())
	}

	fmt.Println("✅ Conexão com MySQL da HostGator bem-sucedida!")
}
