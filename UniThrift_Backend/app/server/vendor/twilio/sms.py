from typing import Any

from app.server.config import config
from app.server.logger.custom_logger import logger
from app.server.vendor.client import sms_client

sms_logger = logger.bind(vendor='Twilio-SMS')


async def send_sms(phone: str, message: str) -> dict[str, Any]:
    """Sends a text message (SMS message) directly to a phone number

    Args:
        phone (str): phone number with country code prefixed
        message (str): message body

    Returns:
        dict[str, Any]: response
    """
    try:
        message_arguments = {'body': message, 'messaging_service_sid': config.TWILIO_MESSAGING_SERVICE_SID, 'to': phone}
        sms_client.messages.create(**message_arguments)
        return {'message': 'Successfully sent sms'}
    except Exception as error:  # pylint: disable=broad-exception-caught
        sms_logger.exception(error)
        return {'message': 'Failed to send sms'}
