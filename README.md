# cookbook

## ormconfig.json
{
    "type": "postgres",
    "host": "0.0.0.0",
    "port": 5432,
    "username": "secret",
    "password": "secret",
    "database": "cookbook_dev",
    "synchronize": true,
    "entities": [
      "js/entity/*.js"
    ],
    "subscribers": [
      "js/subscriber/*.js"
    ],
    "migrations": [
      "js/migration/*.js"
    ],
    "cli": {
      "entitiesDir": "src/entity",
      "migrationsDir": "src/migration",
      "subscribersDir": "src/subscriber"
    },
    "timezone": "UTC"
}

## .env
WORKERS=2
PORT=8080
BASE_URL=/cookbook
STORE_SECRET=asdasdasdasdasdads
DOCKER_PORT=2432

## keycloak.json
{
    "realm": "cookbook-realm",
    "auth-server-url": "https://asky.hopto.org/auth",
    "ssl-required": "external",
    "resource": "cookbook-client-test",
    "public-client": true,
    "confidential-port": 0
}