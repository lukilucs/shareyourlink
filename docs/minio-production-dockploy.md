# MinIO Production Deployment (Dockploy + Traefik)

This guide configures MinIO for ShareYourLinks with private objects, signed URL access, and production compatibility for document preview.

## Why this setup

- Keep all objects private in the `shareyourlink` bucket.
- Serve files from public HTTPS hostnames through Traefik.
- Use signed URLs in the app for both preview and download.
- Keep object keys separated by route prefix (`docs/` and `slides/`).

## Required DNS

Create DNS records pointing to your VPS:

- `s3.yourdomain.com` -> MinIO API
- `minio-console.yourdomain.com` -> MinIO Console

Both must be reachable from the public internet.

## Dockploy compose example

Use this as a base in Dockploy (adjust domains, resolver name, credentials, and network):

```yaml
services:
  minio:
    image: minio/minio:latest
    container_name: minio-server
    command: server /data --console-address ":9001"
    restart: unless-stopped
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
      MINIO_BROWSER_REDIRECT_URL: https://minio-console.yourdomain.com
    volumes:
      - minio_data:/data
    labels:
      - "traefik.enable=true"

      # S3 API (port 9000)
      - "traefik.http.routers.minio-api.rule=Host(`s3.yourdomain.com`)"
      - "traefik.http.routers.minio-api.entrypoints=websecure"
      - "traefik.http.routers.minio-api.tls=true"
      - "traefik.http.routers.minio-api.tls.certresolver=letsencrypt"
      - "traefik.http.services.minio-api.loadbalancer.server.port=9000"

      # Console (port 9001)
      - "traefik.http.routers.minio-console.rule=Host(`minio-console.yourdomain.com`)"
      - "traefik.http.routers.minio-console.entrypoints=websecure"
      - "traefik.http.routers.minio-console.tls=true"
      - "traefik.http.routers.minio-console.tls.certresolver=letsencrypt"
      - "traefik.http.services.minio-console.loadbalancer.server.port=9001"

  minio-setup:
    image: minio/mc:latest
    container_name: minio-setup
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      mc alias set mi https://s3.yourdomain.com ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD};

      mc mb --ignore-existing mi/shareyourlink;

      # IMPORTANT: keep bucket private (do not enable anonymous download)
      # mc anonymous set none mi/shareyourlink;

      touch /tmp/.keep;
      mc cp /tmp/.keep mi/shareyourlink/docs/.keep || true;
      mc cp /tmp/.keep mi/shareyourlink/slides/.keep || true;
      "

volumes:
  minio_data:
```

## CORS policy

If browser fetches are blocked, configure CORS on the bucket for your frontend origin.

Minimum suggested rules:

- Allowed origins: your app domain(s)
- Allowed methods: `GET`, `HEAD`
- Allowed headers: `*`
- Expose headers: `ETag`, `Content-Type`, `Content-Length`

## App environment variables

Set these in your app deployment:

```env
S3_ENDPOINT=https://s3.yourdomain.com
S3_PUBLIC_ENDPOINT=https://s3.yourdomain.com
S3_REGION=us-east-1
S3_ACCESS_KEY=<your_access_key>
S3_SECRET_KEY=<your_secret_key>
S3_BUCKET_NAME=shareyourlink
```

Notes:

- `S3_ENDPOINT` is used for upload/delete operations.
- `S3_PUBLIC_ENDPOINT` is used for signed URLs returned to browsers.
- Keep `forcePathStyle=true` in app SDK config for MinIO compatibility.

## Office preview caveat

`@cyntler/react-doc-viewer` uses Microsoft Office online services for Office documents (`.doc`, `.docx`, `.ppt`, etc.).

That means:

- File URLs must be publicly reachable over HTTPS.
- Localhost, private networks, or VPN-only MinIO endpoints will fail Office preview.
- Download should still work if signed URL is valid.

## Security recommendations

- Do not commit MinIO credentials.
- Use a dedicated app access key instead of root credentials where possible.
- Keep bucket private and rely on signed URLs.
- Keep URL expiration short (for example 5 minutes).

## Verification checklist

1. Upload a PDF to `/docs/create` and retrieve from `/docs/get`.
2. Confirm preview loads and explicit download button works.
3. Upload DOCX and test preview from a real internet connection.
4. Confirm docs are inaccessible after expiration window.
5. Confirm no object is publicly listed or downloadable without a signed URL.
