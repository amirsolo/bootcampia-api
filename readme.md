# Bootcampia API

### Backend API for Bootcampia web app, which is a bootcamp management application

### Built with Node.JS, Express.JS and MongoDB

## Features

- Bootcamps
- Courses
- Reviews

---

## :rocket: Local Development

Start developing locally.

Before you get started make sure you sign up for these service providers

- https://developer.mapquest.com/ (for Geo coding)

#### 1. Clone this repo

```sh
https://github.com/amirsolo/bootcampia.git
```

#### 2. Install all dependencies

```sh
npm install
```

#### 3. Setup environment variables

rename "config/config.env_SAMPLE" to "config/config.env" and update the values/settings to your own.

#### 4. Starting the server

```sh
npm run dev:server

# and to start the production server
npm run prod:server
```

---

## Database Seeder

To seed the database with users, bootcamps, courses and reviews with data from the "\_data" folder, run:

```
# Destroy all data
node seeder -d

# Import all data
node seeder -i
```

---

## :v: Contributing

After cloning & setting up the local project you can push the changes to your github fork and make a pull request.

### Pushing the changes

```bash
git add .
git commit -m "feat: added new stuff"
git push YOUR_REPO_URL BRANCH_NAME
```

---

Documentation with examples [here](https://documenter.getpostman.com/view/11396409/TVssjU7V)

- Version: 1.0.0
- License: MIT
- Author: [Amir Solo](https://amirsolo.com)
