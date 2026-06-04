import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Products
  const inflator = await prisma.product.upsert({
    where: { code: 'DCH-1' },
    update: {},
    create: {
      name: 'Digital Control Head',
      code: 'DCH-1',
      description: 'Primary digital tyre inflator control head',
    },
  });

  const nitrogen = await prisma.product.upsert({
    where: { code: 'NCS-1' },
    update: {},
    create: {
      name: 'Nitrogen Control System',
      code: 'NCS-1',
      description: 'Nitrogen inflation and monitoring system',
    },
  });

  // Variants for Digital Control Head
  const dch_uk = await prisma.variant.upsert({
    where: { code: 'DCH-1-UK' },
    update: {},
    create: {
      productId: inflator.id,
      name: 'UK Forecourt',
      code: 'DCH-1-UK',
      description: 'UK forecourt standard, 240V',
    },
  });

  const dch_eu = await prisma.variant.upsert({
    where: { code: 'DCH-1-EU' },
    update: {},
    create: {
      productId: inflator.id,
      name: 'EU Forecourt',
      code: 'DCH-1-EU',
      description: 'EU forecourt standard, 230V',
    },
  });

  const dch_bt = await prisma.variant.upsert({
    where: { code: 'DCH-1-BT' },
    update: {},
    create: {
      productId: inflator.id,
      name: 'Bluetooth Edition',
      code: 'DCH-1-BT',
      description: 'Bluetooth-enabled variant with fleet connectivity',
    },
  });

  // Variants for Nitrogen Control System
  const ncs_std = await prisma.variant.upsert({
    where: { code: 'NCS-1-STD' },
    update: {},
    create: {
      productId: nitrogen.id,
      name: 'Standard',
      code: 'NCS-1-STD',
      description: 'Standard nitrogen controller',
    },
  });

  // Firmware images
  await prisma.firmwareImage.upsert({
    where: { variantId_version: { variantId: dch_uk.id, version: '2.1.0' } },
    update: {},
    create: {
      variantId: dch_uk.id,
      version: '2.1.0',
      fileName: 'dch1-uk-2.1.0.bin',
      storagePath: 'storage/placeholder/dch1-uk-2.1.0.bin',
      fileSizeBytes: 524288,
      checksumSha256: 'a3f1c2d4e5b6789012345678901234567890abcdef1234567890abcdef123456',
      state: 'RELEASED',
      uploadedBy: 'michael.crookes',
    },
  });

  await prisma.firmwareImage.upsert({
    where: { variantId_version: { variantId: dch_uk.id, version: '2.2.0' } },
    update: {},
    create: {
      variantId: dch_uk.id,
      version: '2.2.0',
      fileName: 'dch1-uk-2.2.0.bin',
      storagePath: 'storage/placeholder/dch1-uk-2.2.0.bin',
      fileSizeBytes: 531200,
      checksumSha256: 'b4e2d3f5a6c7890123456789012345678901bcdef2345678901bcdef234567',
      state: 'TESTING',
      uploadedBy: 'michael.crookes',
    },
  });

  await prisma.firmwareImage.upsert({
    where: { variantId_version: { variantId: dch_eu.id, version: '2.1.0' } },
    update: {},
    create: {
      variantId: dch_eu.id,
      version: '2.1.0',
      fileName: 'dch1-eu-2.1.0.bin',
      storagePath: 'storage/placeholder/dch1-eu-2.1.0.bin',
      fileSizeBytes: 524288,
      checksumSha256: 'c5f3e4a6b7d8901234567890123456789012cdef3456789012cdef345678',
      state: 'RELEASED',
      uploadedBy: 'michael.crookes',
    },
  });

  await prisma.firmwareImage.upsert({
    where: { variantId_version: { variantId: dch_bt.id, version: '1.0.0' } },
    update: {},
    create: {
      variantId: dch_bt.id,
      version: '1.0.0',
      fileName: 'dch1-bt-1.0.0.bin',
      storagePath: 'storage/placeholder/dch1-bt-1.0.0.bin',
      fileSizeBytes: 612400,
      checksumSha256: 'd6a4f5b7c8e9012345678901234567890123def4567890123def456789',
      state: 'DRAFT',
      uploadedBy: 'michael.crookes',
    },
  });

  await prisma.firmwareImage.upsert({
    where: { variantId_version: { variantId: ncs_std.id, version: '3.0.1' } },
    update: {},
    create: {
      variantId: ncs_std.id,
      version: '3.0.1',
      fileName: 'ncs1-std-3.0.1.bin',
      storagePath: 'storage/placeholder/ncs1-std-3.0.1.bin',
      fileSizeBytes: 487200,
      checksumSha256: 'e7b5a6c8d9f0123456789012345678901234ef5678901234ef567890',
      state: 'RELEASED',
      uploadedBy: 'michael.crookes',
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
