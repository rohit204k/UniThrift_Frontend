from datetime import datetime
from typing import Any, Union

from app.server.models.custom_types import EmailStr

# Generic reusable model validator


def capitalize(value: Union[str, list[str]]) -> Union[str, list[str]]:
    """
    Capitalizes a string or a list of strings.

    Args:
        value (Any): The string or list of strings to be capitalized.

    Returns:
        value (Union[str, list[str]]): The capitalized string or list of capitalized strings.
    """
    if isinstance(value, str):
        # Capitalize each word in the string and join them with spaces
        value = ' '.join((word.capitalize()) for word in value.split(' '))
    elif isinstance(value, list):
        # Capitalize each item in the list
        value = [item.capitalize() for item in value]
    return value


def title_case(value: Union[str, list[str]]) -> Union[str, list[str]]:
    """
    Capitalizes the first letter of each word in a string or a list of strings.

    Args:
        value: The input string or list of strings.

    Returns:
        value (Union[str, list[str]]): The input value with the first letter of each word capitalized.
    """
    if isinstance(value, str):
        # Split the string into words and capitalize the first letter of each word
        value = ' '.join((word.title()) for word in value.split(' '))
    elif isinstance(value, list):
        # Capitalize the first letter of each word in each string in the list
        value = [item.title() for item in value]
    return value


def upper_case(value: Union[str, list[str]]) -> Union[str, list[str]]:
    """
    Convert the given string or list to uppercase.

    Args:
        value: The input value to be converted.

    Returns:
        value (Union[str, list[str]]): The converted value in uppercase.
    """
    if isinstance(value, str):
        value = ' '.join((word.upper()) for word in value.split(' '))
    elif isinstance(value, list):
        value = [item.upper() for item in value]
    return value


def str_to_list(value: Union[str, list[str]]) -> Union[str, list[str]]:
    """
    Convert a string or a list of strings into a list of stripped strings.

    Args:
        value: A string or a list of strings.

    Returns:
        value (Union[str, list[str]]): A list of stripped strings. If the input value is empty or None, returns None.
    """
    if isinstance(value, str):
        value = [item.strip() for item in value.split(',')]
    elif isinstance(value, list):
        if len(value) == 1:
            if value[0] == '':
                value = None
            if value:
                value = [item.strip() for item in value[0].split(',')]

    # Remove duplicates
    if value:
        value = [*set(value)]
    return value


def allow_image_content_type(value: Any) -> Any:
    """
    Check if the given value is an image file and raise an error if it is not.

    Args:
        value: The value to check, typically an uploaded file.

    Returns:
        value (Any): The value if it is an image file, otherwise raises a ValueError.
    """
    # If the value is empty, return it as is
    if not value:
        return value

    # Get the file type from the content_type attribute of the value
    file_type = value.content_type.rsplit('/', 1)[0].lower()

    # If the file type is not 'image', raise a ValueError
    if value and file_type not in ['image']:
        content_type = value.content_type
        raise ValueError(f'File of type {content_type} not allowed')

    # Return the value
    return value


def otp_validate(digits: int):
    """
    Returns a validation function for OTP values with a specific number of digits.
    """

    def validate(value) -> int:
        """
        Validates the given OTP value.

        Args:
            value (int): The OTP value to validate.

        Returns:
            int: The validated OTP value.

        Raises:
            ValueError: If the OTP value does not have the specified number of digits.
        """
        if len(str(value)) != digits:
            raise ValueError(f'OTP must be {digits} digits')
        return value

    return validate


def pin_code_validator(digits: int):
    def validate(value):
        """
        Validate a pin code.

        Args:
            value (int): The pin code to be validated.

        Raises:
            ValueError: If the pin code does not have the specified number of digits.

        Returns:
            int: The validated pin code.

        """
        if len(str(value)) < digits:
            raise ValueError(f'Pin code should have {digits} digits')
        return value

    return validate


def email_domain_validator(allowed_domain: str):
    def validate_email_domain(email: EmailStr):
        """
        Validate if the email domain is allowed.

        Args:
            email (EmailStr): The email to be validated.

        Returns:
            str: The validated email.

        Raises:
            ValueError: If the email domain is not allowed.
        """
        # Split the email by '@' and get the domain
        domain = email.split('@')[-1]

        # Check if the domain is allowed
        if domain != allowed_domain:
            raise ValueError(f'Invalid email domain. Allowed domain: {allowed_domain}')

        # Return the validated email
        return email

    # Return the inner function for external use
    return validate_email_domain


def date_format_validator(date_format: str = '%d-%m-%Y', no_past_date: bool = False):
    """
    Returns a function that validates if a given date string matches the specified format
    and checks if it is a past date if required.

    Args:
        date_format (str): The expected format of the date string. Defaults to '%d-%m-%Y'.
        no_past_date (bool): Flag indicating if the date should not be in the past. Defaults to False.

    Returns:
        function: A function that validates the date format and checks if it is a past date if required.
    """

    def validate_date_format(value: str):
        """
        Validates if a given date string matches the specified format and checks if it is a past date if required.

        Args:
            value (str): The date string to validate.

        Returns:
            str: The validated date string.

        Raises:
            ValueError: If the date string does not match the specified format or if it is a past date.
        """
        try:
            parsed_date = datetime.strptime(value, date_format).date()
        except ValueError as error:
            raise ValueError(f'Invalid date format. Expected format: {date_format}') from error

        if no_past_date:
            current_date = datetime.now().date()
            if parsed_date < current_date:
                raise ValueError('Date cannot be in the past')
        return value

    return validate_date_format


def dict_key_length_validator(length: int):
    def validate(value):
        # Your validation logic here, using custom_value
        if len(str(value)) > length:
            raise ValueError(f'Max number if keys allowed is {length}')
        return value

    return validate


def list_validator(min_len: int = None, max_len: int = None):
    """
    Returns a validation function that can be used to validate a list based on the minimum and maximum length.

    Args:
        min_len (int, optional): The minimum length of the list. Defaults to None.
        max_len (int, optional): The maximum length of the list. Defaults to None.

    Returns:
        function: The validation function.
    """

    def validate(value):
        """
        Validates a list based on the minimum and maximum length.

        Args:
            value (list): The list to be validated.

        Raises:
            ValueError: If the length of the list is less than min_len or greater than max_len.

        Returns:
            list: The validated list.
        """
        if len(value) < min_len:
            raise ValueError(f'must have at least {min_len} items')

        if len(value) > max_len:
            raise ValueError(f'cannot have more than {max_len} items')

        return value

    return validate


def decimal_places_validator(decimal_places: int):
    """
    Returns a validator function that checks if a given float value has the specified number of decimal places.

    Args:
        decimal_places (int): The number of decimal places to check for.

    Returns:
        validate_decimal_places (function): The validator function.

    Raises:
        ValueError: If the value is not a float or int, or if it has more than the specified number of decimal places.
    """

    def validate_decimal_places(value: float) -> float:
        """
        Validates if a given float value has the specified number of decimal places.

        Args:
            value (float): The value to validate.

        Returns:
            float: The validated value.

        Raises:
            ValueError: If the value is not a float or int, or if it has more than the specified number of decimal places.
        """
        if not isinstance(value, (float, int)):
            raise ValueError(f'Value {value} is not a float or int')
        if round(value, decimal_places) != value:
            raise ValueError(f'Value {value} has more than {decimal_places} decimal places')
        return value

    return validate_decimal_places


def currency_code_validator():
    """
    Returns a validation function that checks if a given value is a valid
    three-letter ISO currency code.
    """

    def validate(value):
        """
        Validates if the given value is a valid three-letter ISO currency code.

        Args:
            value (str): The value to be validated.

        Raises:
            ValueError: If the value is not a three-letter ISO currency code.

        Returns:
            str: The validated value.
        """
        if len(str(value)) != 3:
            raise ValueError('Currency code must be three letter ISO currency code')
        return value

    return validate
