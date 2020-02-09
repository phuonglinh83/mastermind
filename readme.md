
# Dev setups
## Prerequites
Need following software installed on the machine:
* Postgres 12
* Python 3
## Install requirements
`pip install -r requirements.txt`
## Setup database
* Create database:

`createdb mastermind`
* Migrate database:

`python manage.py db init`

`python manage.py db migrate`

`python manage.py db upgrade`

## Setup enviroment
`export APP_SETTINGS="config.DevelopmentConfig"`

`export DATABASE_URL="postgresql://localhost/mastermind"`

# Start the server
`python server.py`

On web browser, open http://localhost:5000/
