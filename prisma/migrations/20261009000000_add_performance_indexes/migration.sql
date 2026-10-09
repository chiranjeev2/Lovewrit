-- CreateIndex
CREATE INDEX "GuestbookEntry_pageDataId_idx" ON "GuestbookEntry"("pageDataId");

-- CreateIndex
CREATE INDEX "GuestbookEntry_createdAt_idx" ON "GuestbookEntry"("createdAt");

-- CreateIndex
CREATE INDEX "Order_customerEmail_idx" ON "Order"("customerEmail");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_myReferralCode_idx" ON "Order"("myReferralCode");

-- CreateIndex
CREATE INDEX "RateLimitEvent_action_ipAddress_createdAt_idx" ON "RateLimitEvent"("action", "ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX "RateLimitEvent_createdAt_idx" ON "RateLimitEvent"("createdAt");

-- CreateIndex
CREATE INDEX "RecipientReaction_pageDataId_idx" ON "RecipientReaction"("pageDataId");

-- CreateIndex
CREATE INDEX "RecipientReaction_createdAt_idx" ON "RecipientReaction"("createdAt");

-- CreateIndex
CREATE INDEX "ReferralRecord_ownerEmail_idx" ON "ReferralRecord"("ownerEmail");

