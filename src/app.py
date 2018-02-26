import logging
from flask import Flask
from pymongal.database_mongo import MongoDatabase
from src.routes import get_routes
from src.service_controller import ServiceController
from src.settings import settings

import src.commands as commands
import src.error_handlers as error_handlers

logger = logging.getLogger()
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
logger.addHandler(handler)
handler.setFormatter(logging.Formatter('%(asctime)s %(name)s [%(levelname)s] %(message)s'))
logger.info('Starting')

def create_app(database=None):
    app = Flask(__name__)
    if database:
        db = database
    else:
        db = MongoDatabase(settings['DATABASE_HOST'],
                           settings['DATABASE_PORT'],
                           settings['DATABASE_NAME'],
                           )
    service_controller = ServiceController(db, settings)
    register_extensions(app)
    register_error_handlers(app)
    register_blueprints(app, service_controller, db)
    register_commands(app, service_controller, db)
    return app


def register_error_handlers(app):
    error_handlers.init(app)


def register_blueprints(app, service_controller, db):
    routes = get_routes(service_controller, db)
    app.register_blueprint(routes)


def register_extensions(app):
    pass


def register_commands(app, service_controller, db):
    commands.init(app, service_controller, db)


def setup_service_controller(app):
    app['test'] = 5


if __name__ == "__main__":
    app = create_app()
    app.run(host='0.0.0.0', port=5001)
