import { get } from 'env-var'

export const env = {
    PREFIX: get('PREFIX').required().asString(),
    PORT: get('PORT').required().asPortNumber(),
    NODE_ENV: get('NODE_ENV').required().asEnum(['development', 'qa', 'production']),
    MONGO_URI: get('MONGO_URI').required().asUrlString(),
    RABBITMQ_URL: get('RABBITMQ_URL').required().asUrlString(),
    REDIS_URL: get('REDIS_URL').required().asUrlString(),
    JWT_KEY: get('JWT_KEY').required().asString(),
    EMAIL_USER: get('EMAIL_USER').required().asEmailString(),
    EMAIL_PASS: get('EMAIL_PASS').required().asString(),
    SMTP_HOST: get('SMTP_HOST').required().asString(),
    SMTP_PORT: get('SMTP_PORT').required().asInt(),
    SMTP_SECURE: get('SMTP_SECURE').required().asBool(),
    DEVELOPERS_MAILS: get('DEVELOPERS_MAILS').required().asArray(),
    CLOUDFLARE_ACCOUNT_ID: get('CLOUDFLARE_ACCOUNT_ID').required().asString(),
    CLOUDFLARE_BUCKET: get('CLOUDFLARE_BUCKET').required().asString(),
    CLOUDFLARE_ACCESS_KEY_ID: get('CLOUDFLARE_ACCESS_KEY_ID').required().asString(),
    CLOUDFLARE_SECRET_ACCESS_KEY: get('CLOUDFLARE_SECRET_ACCESS_KEY').required().asString(),
}

export type typeEnv = typeof env