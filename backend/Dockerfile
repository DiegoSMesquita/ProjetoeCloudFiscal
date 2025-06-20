# Etapa 1: builder com linux/amd64 (forçado)
FROM --platform=linux/amd64 golang:1.24 AS builder

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server ./cmd/api/main.go

# Etapa 2: imagem final
FROM --platform=linux/amd64 gcr.io/distroless/static:nonroot

WORKDIR /app

COPY --from=builder /app/server .

EXPOSE 8080

USER nonroot

CMD ["./server"]