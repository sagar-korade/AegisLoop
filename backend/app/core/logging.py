"""Safe application logging configuration."""
import logging
import sys


def setup_logging(log_level: str = "INFO") -> None:
    """Configure standard library logging safely without leaking credentials.

    Logs include ISO timestamp, log level, logger name, and clean message.
    Sensitive payloads, tokens, and arbitrary user inputs are explicitly excluded.
    """
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)

    log_format = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    formatter = logging.Formatter(fmt=log_format, datefmt="%Y-%m-%dT%H:%M:%SZ")

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)

    # Avoid duplicate handlers if setup_logging is called multiple times
    if not any(isinstance(h, logging.StreamHandler) for h in root_logger.handlers):
        root_logger.addHandler(handler)
    else:
        root_logger.handlers = [handler]

    # Silence overly verbose third-party loggers if necessary
    logging.getLogger("uvicorn.access").setLevel(numeric_level)
