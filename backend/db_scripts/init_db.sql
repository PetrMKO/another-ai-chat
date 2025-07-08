
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- для gen_random_uuid()

DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS configs CASCADE;
DROP TABLE IF EXISTS message_roles CASCADE;
DROP TABLE IF EXISTS config_types CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS rag CASCADE;

CREATE TABLE config_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE message_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE rag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_msg text                           not null,
    msg_count  integer                        not null,
    rag_id     UUID references rag(id) ON DELETE SET NULL ,
    config_id UUID
);

CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id),
    role_id UUID NOT NULL REFERENCES message_roles(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE configs(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users (id),
    type_id UUID NOT NULL REFERENCES config_types(id),
    url VARCHAR(255) NOT NULL,
    api_key VARCHAR(255),
    llm_name VARCHAR(255),
    CONSTRAINT uix_user_id_type_id unique (user_id, type_id)
);

ALTER TABLE users
ADD CONSTRAINT fk_user_config
FOREIGN KEY (config_id) REFERENCES configs(id) ON DELETE SET NULL;
