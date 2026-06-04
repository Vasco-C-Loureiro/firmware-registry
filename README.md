# Firmware Release Registry

A working prototype built to directly address a problem described in a real engineering conversation: hundreds of firmware images across product variants, managed in a spreadsheet, with no traceability when distributed across an organisation.

If you clone this repo and run one command, you get a service that stores firmware images, tracks which version is released for which variant, verifies file integrity, and logs who did what.

---

## The Problem

PCL manufactures digital inflation control products. Each product has many hardware variants — regional configurations, feature editions, voltage differences. Each variant needs its own firmware binary. Managing hundreds of images in a spreadsheet works internally but breaks the moment firmware needs to be distributed across the wider organisation: no access control, no traceability, no audit trail, no integrity verification.

---

## What It Does

- REST API for products, variants, and firmware images
- Real firmware file upload and download with SHA-256 checksum computed on upload and verified on download
- A release workflow (DRAFT → TESTING → RELEASED → DEPRECATED) with enforced transitions — illegal moves are rejected
- A business rule: promoting an image to RELEASED automatically deprecates the previously released image for that variant, so there is always exactly one current release per variant
- An audit log recording every upload, state change, and download — who did what and when
- A plain dashboard: list and filter firmware, upload, download, change state, view history
- Tests, Dockerised, CI pipeline

---

## Architecture

```text
┌──────────────────────┐
│   React dashboard     │   (Vite + TypeScript)
│  list / upload / etc. │
└───────────┬──────────┘
            │ HTTP (JSON + multipart)
┌───────────▼──────────┐
│     NestJS API        │
│  products / variants  │
│  firmware / audit     │
│  release state machine│
└─────┬───────────┬─────┘
      │           │
      │ Prisma    │ fs streams
      │           │
┌─────▼─────┐ ┌───▼────────┐
│ PostgreSQL │ │  storage/  │  (Docker volume)
│  metadata  │ │  firmware  │
└───────────┘ └────────────┘
```

Metadata and relationships live in PostgreSQL. Firmware binaries live on a mounted volume, referenced by path and verified by checksum. In production the volume becomes object storage (S3 or MinIO).

---

## Run It

**Prerequisites:** Docker Desktop, Node 20+

```bash
# Start the database
docker compose up -d db

# Install dependencies and run migrations
cd api
npm install
npx prisma migrate deploy
npx prisma db seed

# Start the API
npm run start:dev
```

In a second terminal:

```bash
# Start the dashboard
cd web
npm install
npm run dev
```

Open http://localhost:5173

---

## The Release Workflow
DRAFT → TESTING → RELEASED → DEPRECATED
↓
DRAFT

- Every uploaded image starts in DRAFT
- DRAFT can only move to TESTING
- TESTING can move to RELEASED or back to DRAFT if it fails
- Promoting to RELEASED automatically deprecates the current release for that variant
- DEPRECATED is a terminal state

This means there is always exactly one RELEASED image per variant. The system enforces this inside a database transaction — the deprecate and promote either both happen or neither does.

---

## Integrity

On upload, a SHA-256 checksum is computed from the file buffer and stored in the database alongside the metadata. On download, the checksum is recomputed from the bytes on disk and compared against the stored value. A mismatch throws an error — the file is rejected before it reaches the client.

This proves that the file that leaves the registry is exactly the file that was approved.

---

## Audit Trail

Every upload, state transition, and download is recorded with a timestamp and the actor. State changes record both the previous and new state. The audit trail is queryable per image or across all images.
GET /audit                          — all events
GET /audit/firmware/:id             — history for one image

---

## API Endpoints
POST   /products                              Create product
GET    /products                              List products with variants
GET    /products/:id                          Get product
POST   /products/:productId/variants          Create variant
GET    /products/:productId/variants          List variants for product
GET    /variants/:id                          Get variant
POST   /variants/:variantId/firmware          Upload firmware (multipart)
GET    /firmware                              List firmware (filter: variantId, state)
GET    /firmware/:id                          Get firmware metadata
GET    /firmware/:id/download                 Download and verify firmware
PATCH  /firmware/:id/state                    Transition release state
GET    /audit                                 All audit events
GET    /audit/firmware/:firmwareImageId       Audit history for one image

---

## What I Would Do for Production

- **Object storage:** swap local disk for S3 or MinIO; stream uploads directly rather than buffering in memory; serve downloads via short-lived signed URLs so the API never proxies large files
- **Authentication and RBAC:** viewer role versus release manager role — promoting to RELEASED is a privileged action
- **Distribution endpoint:** an endpoint other sites and systems can poll to fetch the current released image for a variant by code — the direct answer to the cross-organisation distribution problem
- **Over-the-air:** devices in the field could check for and pull their approved firmware, with the checksum guaranteeing integrity end to end
- **Indexes and retention:** indexes on the common queries, retention policy on the audit log, immutable audit trail for compliance

---

## Stack

- **API:** NestJS, TypeScript, Prisma ORM, PostgreSQL
- **Dashboard:** Vite, React, TypeScript
- **Infrastructure:** Docker Compose, GitHub Actions CI
