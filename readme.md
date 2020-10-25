# Bootcampia API

> Backend API for Bootcampia web application, which is a bootcamp directory app

## Usage

Rename "config/config.env_SAMPLE" to "config/config.env" and update the values/settings to your own.

## Install Dependencies

```
npm install
```

## Run App

```
# Run in dev mode
npm run dev:server

# Run in prod mode
npm start
```

## Database Seeder

To seed the database with users, bootcamps, courses and reviews with data from the "\_data" folder, run

```
# Destroy all data
node seeder -d

# Import all data
node seeder -i
```

Extensive documentation with examples [here](https://documenter.getpostman.com/view/8923145/SVtVVTzd?version=latest)

- Version: 1.0.0
- License: MIT
- Author: [Amir Solo](https://amirsolo.com)
