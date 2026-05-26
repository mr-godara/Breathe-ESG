# ESG Ingestion Platform Data Model

## Overview
The system is a staged ingestion and review pipeline designed for auditability. Data moves through the following layers:

1. Source data (CSV/API exports)
2. Raw ingestion (`RawRecord`)
3. Normalized emissions (`EmissionRecord`)
4. Review and audit trail (`ReviewAction`, `AuditLog`)

Each layer is persisted so the platform can reprocess, explain, and defend emissions calculations over time.

## Multi-Tenancy Strategy
Tenancy is enforced at the data layer. Every queryable entity that can appear in analyst workflows has an explicit `organization` foreign key. This avoids reliance on implicit tenant context and keeps filtering explicit in queries, services, and APIs.

Tenant-scoped entities:
- `Organization`
- `DataSource`
- `IngestionBatch`
- `RawRecord`
- `EmissionRecord`
- `ReviewAction`
- `AuditLog`

## Raw vs. Normalized Separation
Raw ingestion is stored exactly as received, without modification. Normalized emissions are stored in a separate table with canonical units and calculations. This separation ensures:
- Proof of source evidence (`RawRecord.raw_payload`)
- Reprocessing capability if normalization rules change
- Audit readiness by preserving original inputs

### RawRecord
Captures raw payload, source identifiers, and parsing status. It is the system of record for evidence.

### EmissionRecord
Stores canonical emissions data used for reporting and analysis. It links back to the raw record and data source for traceability.

## Source Traceability
Traceability is enforced through explicit foreign keys:
- `EmissionRecord.raw_record`
- `EmissionRecord.data_source`
- `RawRecord.ingestion_batch`
- `IngestionBatch.data_source`

This chain makes it possible to identify which source file or API sync produced any emission record.

## Auditability
Auditability is achieved using two append-only models:
- `ReviewAction`: analyst decisions and optional comments
- `AuditLog`: system events, including status transitions and audit locks

Approvals lock the emission record and store a snapshot of the locked data. This prevents post-approval mutation while retaining a searchable history of decisions.

## Emissions Categorization
Each `EmissionRecord` is classified by:
- Scope: `S1`, `S2`, `S3`
- Activity category: fuel combustion, electricity, business travel, procurement

These are enforced with enum fields to prevent ad hoc values and keep analytics consistent.

## Normalization Strategy
Normalization standardizes the following fields on every emission record:
- `quantity` + `quantity_unit` (as provided)
- `normalized_quantity` + `normalized_unit` (canonical form)
- `emission_factor` + `emission_factor_unit`
- `emission_amount_kgco2e`

This keeps raw units visible while ensuring downstream reporting is uniform.

## Review Workflow
The review lifecycle is represented by:
- `EmissionRecord.review_status` (Pending/Approved/Rejected)
- `ReviewAction` history for analyst actions
- `AuditLog` entries for status transitions and lock events

Approved records are locked and snapshot for audit.

## Suspicious Record Lifecycle
Suspicious flags are stored on both raw and normalized records. They are generated during ingestion and normalization by rule-based validation. Analysts can filter the review queue to focus on suspicious records and still approve or reject them.

## Indexing Decisions
Indexes are designed around analyst queries and reconciliation patterns:
- `organization + review_status` for review queues
- `organization + scope` for scope reporting
- `data_source + activity_date` for source reconciliation
- `organization + data_source + received_at` for ingestion timelines
- `raw_hash_sha256` for duplicate detection

These indexes prioritize read patterns without introducing unnecessary write overhead.
