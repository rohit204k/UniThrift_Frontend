import uuid


def generate_unique_id():
    """
    Generate a unique ID.

    Returns:
        str: A string representation of a unique ID.
    """
    return str(uuid.uuid4())
