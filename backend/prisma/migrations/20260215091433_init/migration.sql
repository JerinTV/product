-- CreateTable
CREATE TABLE "Batch" (
    "id" SERIAL NOT NULL,
    "batchId" TEXT NOT NULL,
    "boxId" TEXT NOT NULL,
    "batchSize" INTEGER NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "manufacturerDate" TEXT NOT NULL,
    "manufacturePlace" TEXT NOT NULL,
    "modelNumber" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "shipped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "productId" TEXT NOT NULL,
    "boxId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "manufacturerDate" TEXT NOT NULL,
    "manufacturePlace" TEXT NOT NULL,
    "modelNumber" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "warrantyPeriod" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "specs" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "image" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "sold" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Batch_batchId_key" ON "Batch"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_productId_key" ON "Product"("productId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_batchNumber_fkey" FOREIGN KEY ("batchNumber") REFERENCES "Batch"("batchId") ON DELETE RESTRICT ON UPDATE CASCADE;
