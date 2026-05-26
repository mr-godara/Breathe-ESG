# Tradeoffs (Prototype Scope)

## 1) Async Processing Queues
**Why excluded:** The prototype focuses on data modeling, traceability, and review workflows rather than throughput.

**Production would require:** Background job processing (e.g., Celery), retries, idempotency keys, ingest monitoring, and dead-letter handling.

**Why reasonable here:** Synchronous ingestion is simpler to validate and aligns with a small, realistic data volume for demos.

## 2) OCR/PDF Utility Bill Extraction
**Why excluded:** PDF parsing adds brittle extraction logic and distracts from normalized data modeling.

**Production would require:** OCR pipelines, template matching, vendor-specific parsers, and QA sampling workflows.

**Why reasonable here:** Most utility portals can export CSV; CSV ingestion proves the normalization and review flow.

## 3) RBAC and Authentication
**Why excluded:** Identity systems are complex and outside the prototype’s focus.

**Production would require:** SSO/SAML or OAuth, role-based access controls, audit policies, and secure session handling.

**Why reasonable here:** The workflow can be demonstrated with stubbed analyst identity while keeping the architecture clear.

## 4) ML Anomaly Detection
**Why excluded:** ML models need training data, drift monitoring, and interpretability to be defensible.

**Production would require:** Model governance, explainability, retraining cadence, and false-positive management.

**Why reasonable here:** Deterministic rules are transparent and sufficient for a prototype review pipeline.

## 5) Large-Scale Ingestion Optimization
**Why excluded:** Partitioning, batching, and streaming are premature without known scale constraints.

**Production would require:** Batch partitioning, parallel ingestion, database tuning, and archival strategies.

**Why reasonable here:** The prototype demonstrates correct data flow and auditability without scale complexity.
