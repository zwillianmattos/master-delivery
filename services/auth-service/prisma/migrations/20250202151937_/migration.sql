/*
  Warnings:

  - You are about to drop the column `isDefault` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `addresses` table. All the data in the column will be lost.
  - The `roles` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `country` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CUSTOMER', 'RESTAURANT', 'COURIER');

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "isDefault",
DROP COLUMN "zip",
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "number" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "metadata" JSONB,
DROP COLUMN "roles",
ADD COLUMN     "roles" "UserRole"[];

-- DropEnum
DROP TYPE "UserRoles";
