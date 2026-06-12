import os

import cloudinary
import cloudinary.api
import cloudinary.uploader
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class CloudinaryMediaStorage(Storage):
    """Minimal Cloudinary storage for user-uploaded media files only.

    Static files continue to be served by WhiteNoise unchanged.
    Activated only when CLOUDINARY_URL env var is present.
    """

    def _save(self, name, content):
        public_id = name.replace("\\", "/")
        if hasattr(content, "seek"):
            content.seek(0)
        result = cloudinary.uploader.upload(
            content,
            public_id=public_id,
            resource_type="auto",
            overwrite=True,
        )
        return result["public_id"]

    def url(self, name):
        return cloudinary.CloudinaryImage(name).build_url(secure=True)

    def exists(self, name):
        try:
            cloudinary.api.resource(name)
            return True
        except Exception:
            return False

    def delete(self, name):
        try:
            cloudinary.uploader.destroy(name, invalidate=True)
        except Exception:
            pass

    def _open(self, name, mode="rb"):
        raise NotImplementedError("Direct file reading via Cloudinary storage is not supported.")

    def size(self, name):
        try:
            info = cloudinary.api.resource(name)
            return info.get("bytes", 0)
        except Exception:
            return 0
