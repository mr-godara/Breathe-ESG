# Design Decisions (Prototype)

## Why SAP CSV Export Instead of OData/BAPI
- CSV exports are common in SAP MM procurement workflows and are available without deep SAP integration.
- OData/BAPI integration requires authentication, service discovery, and per-client configuration that is out of scope for a prototype.
- CSV ingestion keeps the prototype focused on normalization, traceability, and auditability rather than SAP connectivity.

## Why Utility CSV Ingestion Instead of PDF Parsing
- Utility portals typically provide CSV or XLS exports even when invoices are delivered as PDFs.
- PDF parsing adds brittle OCR/templating logic and does not improve the core data modeling story.
- CSV allows stable column mapping and predictable validation rules for billing periods.

## Why Mocked Travel API Integration
- Concur/Navan-style APIs require partner access, OAuth setup, and per-tenant credentials.
- A mocked API still exercises real ingestion patterns: missing fields, inconsistent distances, and category mapping.
- The goal is to show traceable normalization logic without spending the prototype budget on authentication flows.

## Assumptions Made
- Emission factors are simplified and deterministic (not region-specific).
- Units can be normalized to a small set (kg, L, kWh, km).
- Plant codes map to a small location list for demo purposes.
- Analysts are identified by a name string rather than an identity provider.
- Travel distances may be missing and are treated as suspicious rather than rejected.

## Ambiguities Resolved
- How to handle invalid dates: preserve the raw record, flag it, and skip normalization.
- How to handle unknown units: preserve raw data, flag, and still allow analyst review.
- Whether to split raw records into multiple emissions: supported via one-to-many relation but not used in ingestion examples.
- Whether approvals should lock records: approvals lock and snapshot the record for audit.

## Questions to Ask a PM in a Real Project
- What is the accepted source of truth for emission factors and how often do they change?
- Are there regulatory standards we must align with (e.g., GHG Protocol, CDP)?
- What is the expected cadence and volume per source system?
- Which validation errors should block ingestion versus require review?
- What tenant isolation requirements exist (row-level security, per-tenant databases)?
- What audit evidence must be retained and for how long?

## What Production Systems Would Require Additionally
- Strong authentication and role-based access control.
- Verified identity and immutable audit storage (hash-chaining or WORM).
- Emission factor versioning and provenance.
- Background job processing, retries, and monitoring.
- Data retention and legal hold policies.
- Formal data contracts per source and schema evolution management.
