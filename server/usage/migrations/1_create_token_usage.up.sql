CREATE TABLE token_usage (
    id          BIGSERIAL PRIMARY KEY,
    user_id     TEXT NOT NULL,
    tokens_used BIGINT NOT NULL DEFAULT 0,
    period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    plan_type   TEXT NOT NULL DEFAULT 'free',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_token_usage_user_id ON token_usage (user_id);
CREATE INDEX idx_token_usage_plan_type ON token_usage (plan_type);
