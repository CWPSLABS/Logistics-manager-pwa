import re


GHANA_POST_PATTERN = re.compile(r"^[A-Z]{2}-\d{3,4}-\d{4}$")


def is_valid_ghana_post_code(code: str) -> bool:
    """
    Validates a Ghana Post GPS code.
    Format: XX-XXXX-XXXX or XX-XXX-XXXX
    Example: GA-123-4567, AK-0023-1234
    """
    if not code:
        return False
    return bool(GHANA_POST_PATTERN.match(code.strip().upper()))


def format_ghana_post_code(code: str) -> str:
    """
    Normalizes a Ghana Post GPS code to uppercase stripped format.
    """
    return code.strip().upper()


def extract_region_from_code(code: str) -> str:
    """
    Extracts the region prefix from a Ghana Post GPS code.
    GA = Greater Accra, AK = Ashanti, etc.
    """
    if not is_valid_ghana_post_code(code):
        return "Unknown"
    return code.split("-")[0].upper()


REGION_CODES = {
    "GA": "Greater Accra",
    "AK": "Ashanti",
    "BA": "Brong-Ahafo",
    "BE": "Bono East",
    "AH": "Ahafo",
    "CP": "Central",
    "EP": "Eastern",
    "NP": "Northern",
    "NE": "North East",
    "SA": "Savannah",
    "UE": "Upper East",
    "UW": "Upper West",
    "TV": "Volta",
    "WP": "Western",
    "WN": "Western North",
    "OT": "Oti",
}


def get_region_name(code: str) -> str:
    """
    Returns the full region name from a Ghana Post GPS code.
    """
    prefix = extract_region_from_code(code)
    return REGION_CODES.get(prefix, "Unknown Region")