CREATE TABLE xml_files (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    cnpj VARCHAR(18) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    checksum VARCHAR(64) UNIQUE NOT NULL,
    model_type VARCHAR(10) NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    file_size BIGINT,
    status VARCHAR(20) DEFAULT 'pending'
);

CREATE INDEX idx_xml_cnpj ON xml_files(cnpj);
CREATE INDEX idx_xml_model_type ON xml_files(model_type);