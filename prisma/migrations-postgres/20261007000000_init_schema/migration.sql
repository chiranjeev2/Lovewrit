-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'SELF_SERVICE',
    "isBundle" BOOLEAN NOT NULL DEFAULT false,
    "customNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "founderStatus" TEXT NOT NULL DEFAULT 'NOT_APPLICABLE',
    "founderAssignedLink" TEXT,
    "adminToken" TEXT,
    "currency" TEXT NOT NULL,
    "amountTotal" INTEGER NOT NULL,
    "region" TEXT NOT NULL,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "paymentProvider" TEXT NOT NULL DEFAULT 'razorpay',
    "ipAddress" TEXT,
    "isAdSupported" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pinCode" TEXT,
    "nickname" TEXT,
    "tipUpiId" TEXT,
    "tipPaypalUsername" TEXT,
    "referralCodeUsed" TEXT,
    "myReferralCode" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardData" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "occasion" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "secondaryMessage" TEXT,
    "photoUrl" TEXT NOT NULL,
    "photoShape" TEXT NOT NULL DEFAULT 'oval',
    "colorTheme" TEXT NOT NULL DEFAULT 'rose',
    "fontFamily" TEXT NOT NULL DEFAULT 'serif',
    "borderStyle" TEXT NOT NULL DEFAULT 'classic',
    "stickersJson" TEXT,
    "isFlipReveal" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "venueName" TEXT,
    "venueAddress" TEXT,
    "venueMapUrl" TEXT,
    "voiceMessageUrl" TEXT,
    "revealAt" TIMESTAMP(3),
    "showOmMotif" BOOLEAN NOT NULL DEFAULT false,
    "showBismillah" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'en',
    "secondaryLanguage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageData" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "occasion" TEXT NOT NULL,
    "letter" TEXT NOT NULL,
    "photoUrls" TEXT NOT NULL,
    "collageLayout" TEXT DEFAULT 'masonry',
    "musicTrack" TEXT,
    "musicType" TEXT DEFAULT 'builtin',
    "isProposal" BOOLEAN NOT NULL DEFAULT false,
    "proposalQuestion" TEXT DEFAULT 'marry_me',
    "colorTheme" TEXT NOT NULL DEFAULT 'rose',
    "fontFamily" TEXT NOT NULL DEFAULT 'serif',
    "ambientEffect" TEXT DEFAULT 'none',
    "timelineJson" TEXT,
    "secretNotesJson" TEXT,
    "milestoneVenue" TEXT,
    "venueName" TEXT,
    "venueAddress" TEXT,
    "venueMapUrl" TEXT,
    "voiceMessageUrl" TEXT,
    "revealAt" TIMESTAMP(3),
    "showOmMotif" BOOLEAN NOT NULL DEFAULT false,
    "showBismillah" BOOLEAN NOT NULL DEFAULT false,
    "isAdSupported" BOOLEAN NOT NULL DEFAULT false,
    "requireGuestbookApproval" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'en',
    "scenesJson" TEXT,
    "sceneEngineEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipientReaction" (
    "id" TEXT NOT NULL,
    "pageDataId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "reactionType" TEXT NOT NULL DEFAULT 'text',
    "message" TEXT,
    "voiceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipientReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralRecord" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "creditBalance" INTEGER NOT NULL DEFAULT 0,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestbookEntry" (
    "id" TEXT NOT NULL,
    "pageDataId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attendance" TEXT DEFAULT 'ATTENDING',
    "headcount" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestbookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitEvent" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "email" TEXT,
    "action" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_slug_key" ON "Order"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Order_razorpayOrderId_key" ON "Order"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "CardData_orderId_key" ON "CardData"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "PageData_orderId_key" ON "PageData"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralRecord_code_key" ON "ReferralRecord"("code");

-- AddForeignKey
ALTER TABLE "CardData" ADD CONSTRAINT "CardData_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageData" ADD CONSTRAINT "PageData_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipientReaction" ADD CONSTRAINT "RecipientReaction_pageDataId_fkey" FOREIGN KEY ("pageDataId") REFERENCES "PageData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestbookEntry" ADD CONSTRAINT "GuestbookEntry_pageDataId_fkey" FOREIGN KEY ("pageDataId") REFERENCES "PageData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
