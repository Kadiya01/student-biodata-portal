-- Add performance indexes for 500+ concurrent user scale

CREATE INDEX IF NOT EXISTS "User_isActive_idx" ON "User"("isActive");

CREATE INDEX IF NOT EXISTS "StudentProfile_updatedAt_idx" ON "StudentProfile"("updatedAt");
CREATE INDEX IF NOT EXISTS "StudentProfile_reviewedBy_idx" ON "StudentProfile"("reviewedBy");
CREATE INDEX IF NOT EXISTS "StudentProfile_reviewedAt_idx" ON "StudentProfile"("reviewedAt");

CREATE INDEX IF NOT EXISTS "AuditLog_entityType_idx" ON "AuditLog"("entityType");
