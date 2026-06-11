import logging

from django.apps import AppConfig

logger = logging.getLogger('billing')


class BillingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'billing'

    def ready(self):
        import billing.signals  # noqa: F401
        self._log_polar_config()

    @staticmethod
    def _log_polar_config():
        from django.conf import settings

        pids = getattr(settings, 'POLAR_PRODUCT_IDS', {})
        has_token = bool(getattr(settings, 'POLAR_ACCESS_TOKEN', ''))
        has_launch = bool(pids.get('launch'))
        has_pro = bool(pids.get('pro'))
        has_growth = bool(pids.get('growth'))
        has_agency = bool(pids.get('agency'))
        configured = has_token and has_launch and has_pro and has_growth and has_agency

        logger.info(
            '[Polar startup] server=%s env=%s '
            'has_token=%s launch=%s pro=%s growth=%s agency=%s '
            'provider_configured=%s',
            getattr(settings, 'POLAR_SERVER', 'MISSING'),
            getattr(settings, 'POLAR_ENV', 'MISSING'),
            has_token, has_launch, has_pro, has_growth, has_agency,
            configured,
        )
