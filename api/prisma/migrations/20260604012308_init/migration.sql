-- CreateEnum
CREATE TYPE "ReleaseState" AS ENUM ('DRAFT', 'TESTING', 'RELEASED', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('UPLOADED', 'STATE_CHANGED', 'DOWNLOADED');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirmwareImage" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "state" "ReleaseState" NOT NULL DEFAULT 'DRAFT',
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FirmwareImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "firmwareImageId" TEXT,
    "action" "AuditAction" NOT NULL,
    "fromState" "ReleaseState",
    "toState" "ReleaseState",
    "actor" TEXT NOT NULL,
    "detail" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_code_key" ON "Variant"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FirmwareImage_variantId_version_key" ON "FirmwareImage"("variantId", "version");

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FirmwareImage" ADD CONSTRAINT "FirmwareImage_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_firmwareImageId_fkey" FOREIGN KEY ("firmwareImageId") REFERENCES "FirmwareImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
