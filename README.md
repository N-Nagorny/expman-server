# ExpMan

## docker-compose
ExpMan is adapted to deploy with docker-compose. There are two Docker containers:
1. `postgresql` which contains a DBMS instance of the same name.
2. `expman-server` which contains the application itself.

### Launching with docker-compose
1. `docker-compose build` to build the containers.
2. `docker-compose up` to run the containers.
3. `docker-compose down -v` to shut down the containers and flush the database.