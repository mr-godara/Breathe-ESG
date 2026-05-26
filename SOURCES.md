# Sources and Data Assumptions

This document captures the real-world formats that informed the prototype, plus the modeled constraints and limitations.

## SAP (Procurement / Fuel)
**Researched export formats:** SAP MM exports are commonly delivered as CSV/Excel with localized headers and locale-specific number formats. Many enterprises still distribute flat exports for procurement and fuel spend reconciliation.

**Why CSV export was chosen:** CSV is a realistic, low-friction export and matches the types of extracts shared with sustainability teams. OData/BAPI integration requires SAP service configuration and auth workflows outside the prototype scope.

**Inconsistencies modeled:**
- German header names (e.g., `Belegdatum`, `Werk`, `Menge`, `Einheit`)
- Mixed decimal formats (comma-based decimals)
- Inconsistent unit capitalization
- Missing plant codes or supplier values
- Non-uniform date formats

## Utility Electricity
**Realistic portal exports:** Utility portals typically provide CSV or XLS usage exports with billing start/end dates, meter IDs, and kWh usage. Many also export in different units (kWh, MWh).

**Billing period handling:** The prototype treats billing periods as first-class fields (`period_start`, `period_end`) and flags unusually short or long periods to match real portal variability.

**Unit normalization considerations:** Usage is normalized to kWh for canonical reporting. Units outside a defined mapping are flagged but preserved in raw payloads.

## Travel (Concur/Navan-Style APIs)
**API style:** Concur/Navan APIs typically return trip-level data with traveler identifiers, origin/destination airport codes, class of travel, and optional distance fields.

**Airport-code-based data:** The prototype uses IATA-like airport codes to represent origin/destination pairs and flags same-origin trips as suspicious.

**Missing distance scenarios:** Some travel platforms omit distance, especially for rail or when routes are not fully captured. The prototype flags missing distance but preserves the trip for analyst review.

## Sample Data Assumptions
- Emission factors are simplified and constant by category.
- Units are normalized to a small canonical set.
- Plant codes map to a fixed list of locations.
- Review actions are identified by analyst name strings.

## Limitations of Prototype Realism
- No live integration with SAP or travel APIs.
- No OCR/PDF extraction for utility invoices.
- No emission factor versioning or regional factors.
- Limited unit catalogs and validation coverage.

## What Would Break in Real Enterprise Deployment
- High-volume ingestion would need async processing and scaling.
- Enterprise auth and RBAC would be required for compliance.
- Emission factor governance and audit trails would need formal controls.
- Source systems would require contractual data contracts and schema evolution handling.
