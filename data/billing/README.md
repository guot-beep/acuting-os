# Billing and Insurance Coding Layer

This layer is a training scaffold for learning how clinical documentation may connect to insurance coding and claim preparation. It is not a real billing engine and should not be used to submit claims without current payer, clinic, state, and professional guidance.

## Design Principle

Keep clinical care, coding, and claim submission separate:

- Clinical case notes record what happened.
- SOAP notes support medical necessity and continuity of care.
- Diagnosis codes describe why care was provided.
- Procedure/service codes describe what was done.
- Payer rules describe what a specific insurer or plan requires.
- Claim drafts collect the proposed billing data for review.

## Why Separate?

The same visit may have:

- A clinical TCM diagnosis.
- A Western diagnosis.
- One or more ICD-style diagnosis codes.
- One or more CPT/HCPCS-style service codes.
- Documentation requirements.
- Units, modifiers, place of service, rendering provider, supervising provider, and payer-specific rules.

These should not be mixed into the SOAP note text. The SOAP note should support the billing/coding layer.

## Future Workflow

1. Finish SOAP note.
2. Link the visit to Western diagnoses and clinical indications.
3. Draft diagnosis codes.
4. Draft procedure/service codes.
5. Check payer rules and required documentation.
6. Mark missing items.
7. Review with supervisor/billing staff.
8. Export claim draft or learning report.

## Safety

Do not treat this as legal, billing, or reimbursement advice. Codes and payer rules change. Future entries should store:

- Source name
- Source URL or manual reference
- Effective date
- Review date
- Payer/clinic applicability
- Supervisor approval status
