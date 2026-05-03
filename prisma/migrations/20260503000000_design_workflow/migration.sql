-- Design workflow: DesignReference + DesignVariant
CREATE TYPE "DesignReferenceSourceType" AS ENUM ('stitch', 'manual', 'screenshot', 'code', 'other');
CREATE TYPE "DesignVariantType" AS ENUM ('safe_conversion', 'premium_cinematic', 'bold_experimental', 'custom');

CREATE TABLE "DesignReference" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "demoConfigId" TEXT,
    "sourceType" "DesignReferenceSourceType" NOT NULL,
    "rawText" TEXT NOT NULL,
    "screenshotUrlsJson" JSONB,
    "codeSnippet" TEXT,
    "selectedVariantName" TEXT,
    "parsedReferenceJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DesignReference_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DesignVariant" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "demoConfigId" TEXT NOT NULL,
    "sourceReferenceId" TEXT,
    "name" TEXT NOT NULL,
    "variantType" "DesignVariantType" NOT NULL,
    "designMdJson" JSONB,
    "visualDirectionJson" JSONB,
    "sceneSpecJson" JSONB,
    "pageStrategyJson" JSONB,
    "sectionOrderJson" JSONB,
    "score" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DesignVariant_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DesignReference_businessId_idx" ON "DesignReference"("businessId");
CREATE INDEX "DesignReference_demoConfigId_idx" ON "DesignReference"("demoConfigId");
CREATE INDEX "DesignVariant_businessId_idx" ON "DesignVariant"("businessId");
CREATE INDEX "DesignVariant_demoConfigId_idx" ON "DesignVariant"("demoConfigId");
CREATE INDEX "DesignVariant_selected_idx" ON "DesignVariant"("selected");

ALTER TABLE "DesignReference" ADD CONSTRAINT "DesignReference_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DesignReference" ADD CONSTRAINT "DesignReference_demoConfigId_fkey" FOREIGN KEY ("demoConfigId") REFERENCES "DemoConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DesignVariant" ADD CONSTRAINT "DesignVariant_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DesignVariant" ADD CONSTRAINT "DesignVariant_demoConfigId_fkey" FOREIGN KEY ("demoConfigId") REFERENCES "DemoConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DesignVariant" ADD CONSTRAINT "DesignVariant_sourceReferenceId_fkey" FOREIGN KEY ("sourceReferenceId") REFERENCES "DesignReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;
