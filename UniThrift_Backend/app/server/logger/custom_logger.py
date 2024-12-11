import logging
import sys

from loguru import logger

from app.server.static import constants

logging.getLogger('uvicorn').handlers.clear()

FORMAT = '{level} | {time} | {message}'
logger.remove(0)
logger.add(sys.stdout, level='DEBUG', format=FORMAT, enqueue=True, backtrace=False, diagnose=False, serialize=1)
logger.add('logs/app.log', rotation='10 MB', retention=5, format=FORMAT, enqueue=True, backtrace=False, diagnose=False, serialize=1)
logger.add(sys.stderr, level='ERROR', format=FORMAT, enqueue=True, backtrace=False, diagnose=False, serialize=1)
logger = logger.bind(service=constants.LOGGER_SERVICE_NAME)
