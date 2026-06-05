# Deploy Production Guide

Huong dan nay dung cho project AquaticCaps tren VPS Ubuntu 24.04, domain `aquaticcaps.id.vn`, Docker Compose production va Nginx host lam reverse proxy/SSL.

## 1. Chuan bi VPS

SSH vao server:

```bash
ssh root@103.70.13.127
```

Cap nhat he thong va cai cac goi can thiet:

```bash
apt update && apt upgrade -y
apt install -y git curl nginx ufw certbot python3-certbot-nginx
```

Cai Docker:

```bash
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin
systemctl enable docker
systemctl start docker
```

Cau hinh firewall:

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

## 2. Clone source tu branch dev

```bash
cd /opt
git clone -b dev https://github.com/zeus1411/POSEproject.git aquaticcaps
cd /opt/aquaticcaps
```

Neu da clone nham branch `main`, chuyen sang `dev`:

```bash
cd /opt/aquaticcaps
git fetch origin
git switch dev
git pull origin dev
```

Kiem tra file production compose:

```bash
ls docker-compose.prod.yml
```

## 3. Tao file env production

File `server/.env.production` thuong khong commit len Git vi chua secret. Tao truc tiep tren VPS:

```bash
nano /opt/aquaticcaps/server/.env.production
```

Mau noi dung:

```env
PORT=3000
DATABASE_NAME=AquaticStorePOSE
MONGODB_URI=mongodb://admin:<MONGO_PASSWORD>@mongodb:27017/AquaticStorePOSE?authSource=admin

JWT_SECRET=<JWT_SECRET>
JWT_LIFETIME=1d
NODE_ENV=production

CLIENT_URL=https://aquaticcaps.id.vn
SERVER_PUBLIC_URL=https://aquaticcaps.id.vn

REDIS_URL=redis://redis:6379

GEMINI_API_KEY=<GEMINI_API_KEY>
GEMINI_MODEL=gemini-1.5-flash-latest
GEMINI_EMBED_MODEL=gemini-embedding-001
GEMINI_EMBED_MAX_RETRIES=2
GEMINI_EMBED_RETRY_BUFFER_MS=250
GEMINI_MAX_OUTPUT_TOKENS=2048

DOC_CHUNK_SIZE=1800
DOC_CHUNK_OVERLAP=250
DOC_TOP_K=5
DOC_SCORE_THRESHOLD=0.2
DOC_MIN_TEXT_LENGTH=30
DOC_MAX_FILE_SIZE_MB=25
AI_DOC_UPLOAD_DIR=uploads/ai-docs

QDRANT_URL=http://qdrant:6333
QDRANT_API_KEY=
QDRANT_DOCS_COLLECTION=docs_collection
QDRANT_CATALOG_COLLECTION=catalog_collection

CATALOG_TOP_K=5
CATALOG_SCORE_THRESHOLD=0.2
CATALOG_SYNC_INTERVAL_MINUTES=10
CATALOG_SYNC_DEBOUNCE_MS=30000

STRIPE_SECRET_KEY=<STRIPE_SECRET_KEY>
STRIPE_WEBHOOK_SECRET=<STRIPE_WEBHOOK_SECRET>

VNPAY_TMN_CODE=<VNPAY_TMN_CODE>
VNPAY_HASH_SECRET=<VNPAY_HASH_SECRET>
VNPAY_HOST=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_DEBUG=true
VNPAY_SIGN_MODE=legacy
VNPAY_INCLUDE_IPN_PARAM=false

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<EMAIL_USER>
EMAIL_PASS=<EMAIL_APP_PASSWORD>
EMAIL_FROM=<EMAIL_FROM>
EMAIL_FROM_NAME=AquaticCaps

CLOUDINARY_CLOUD_NAME=<CLOUDINARY_CLOUD_NAME>
CLOUDINARY_API_KEY=<CLOUDINARY_API_KEY>
CLOUDINARY_API_SECRET=<CLOUDINARY_API_SECRET>

PROVINCES_OPEN_API=https://provinces.open-api.vn/api

GOOGLE_CLIENT_ID=<GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<GOOGLE_CLIENT_SECRET>
```

Luu y: VNPay sandbox chi dung de test. Khi chay thanh toan that, thay `VNPAY_HOST`, `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET` bang thong tin production tu VNPay.

## 4. Tao client env neu thieu

Neu build frontend bao loi `COPY .env.docker .env` hoac `client/.env.docker not found`, tao file:

```bash
nano /opt/aquaticcaps/client/.env.docker
```

Noi dung:

```env
VITE_API_URL=/api/v1
VITE_TINYMCE_API_KEY=<TINYMCE_API_KEY>
```

## 5. Build va chay Docker production

Kiem tra compose:

```bash
cd /opt/aquaticcaps
docker compose -f docker-compose.prod.yml config --quiet
```

Build va start:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Kiem tra container:

```bash
docker compose -f docker-compose.prod.yml ps
```

Can thay cac container chay `Up`:

- `pose_frontend`
- `pose_backend`
- `pose_mongodb`
- `pose_redis`
- `pose_qdrant`

Xem log backend:

```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

Test frontend container:

```bash
curl -I http://127.0.0.1:8080
```

## 6. Cau hinh Nginx host

Tao file site:

```bash
nano /etc/nginx/sites-available/aquaticcaps.id.vn
```

Noi dung:

```nginx
server {
    listen 80;
    server_name aquaticcaps.id.vn www.aquaticcaps.id.vn;

    client_max_body_size 30M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable site va reload Nginx:

```bash
ln -s /etc/nginx/sites-available/aquaticcaps.id.vn /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

Test HTTP:

```bash
curl -I http://aquaticcaps.id.vn
```

## 7. Cai SSL voi Certbot

Neu ca domain goc va `www` deu tro ve VPS:

```bash
certbot --nginx -d aquaticcaps.id.vn -d www.aquaticcaps.id.vn
```

Neu chi dung domain goc:

```bash
certbot --nginx -d aquaticcaps.id.vn
```

Kiem tra:

```bash
certbot --version
certbot renew --dry-run
curl -I https://aquaticcaps.id.vn
```

## 8. Restore MongoDB data

Folder backup `server/MONGODB` dang nam trong `.gitignore`, nen sau khi clone tren VPS se khong co folder nay. Upload tu may local len VPS.

Tao folder tren VPS:

```bash
mkdir -p /opt/aquaticcaps/server/MONGODB
```

Tu may local Windows, chay PowerShell:

```powershell
scp -r "E:\POSE project\server\MONGODB\*" root@103.70.13.127:/opt/aquaticcaps/server/MONGODB/
```

Kiem tra tren VPS:

```bash
ls -lh /opt/aquaticcaps/server/MONGODB
```

Import toan bo collection:

```bash
cd /opt/aquaticcaps/server

for file in MONGODB/AquaticStorePOSE.*.json; do
  collection=$(basename "$file" .json | sed 's/AquaticStorePOSE\.//')

  echo "Importing $file -> collection: $collection"

  docker cp "$file" pose_mongodb:/tmp/$(basename "$file")

  docker exec pose_mongodb mongoimport \
    --uri="mongodb://admin:<MONGO_PASSWORD>@localhost:27017/AquaticStorePOSE?authSource=admin" \
    --collection="$collection" \
    --file="/tmp/$(basename "$file")" \
    --jsonArray \
    --drop
done
```

Kiem tra so document:

```bash
docker exec pose_mongodb mongosh \
  "mongodb://admin:<MONGO_PASSWORD>@localhost:27017/AquaticStorePOSE?authSource=admin" \
  --eval 'db.getCollectionNames().forEach(c => print(c + ": " + db[c].countDocuments()))'
```

Restart backend:

```bash
cd /opt/aquaticcaps
docker compose -f docker-compose.prod.yml restart backend
```

## 9. Lenh van hanh hang ngay

Update code va deploy lai:

```bash
cd /opt/aquaticcaps
git pull origin dev
docker compose -f docker-compose.prod.yml up -d --build
```

Xem trang thai:

```bash
docker compose -f docker-compose.prod.yml ps
```

Xem log:

```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
journalctl -u nginx -f
```

Restart tung service:

```bash
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart frontend
```

Dung app:

```bash
docker compose -f docker-compose.prod.yml down
```

Start lai:

```bash
docker compose -f docker-compose.prod.yml up -d
```

## 10. Checklist sau deploy

- Mo `https://aquaticcaps.id.vn`
- Kiem tra san pham, blog, danh muc da co data
- Test login/register
- Test gio hang va checkout
- Test VNPay sandbox
- Test upload anh/blog neu co
- Test chat/socket
- Test AI/RAG neu dung Gemini va Qdrant
- Chay `certbot renew --dry-run`

## 11. Luu y bao mat

- Khong commit `.env.production`.
- Sau khi secret bi chia se qua chat/log, nen rotate lai key khi co thoi gian: Gemini, Gmail app password, Cloudinary, Google OAuth, Stripe, VNPay.
- MongoDB, Redis, Qdrant khong nen public port ra internet. Production compose hien chi expose frontend/backend qua localhost cho Nginx proxy.
