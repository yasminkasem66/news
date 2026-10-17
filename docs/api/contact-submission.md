# Contract: Contact Submission (custom Web API controller)

The only write capability in this feature (User Story 7), and the only endpoint not served by the
Delivery API (Constitution Principle II exception). Implemented as a plain ASP.NET Core Web API
controller, not an Umbraco controller/surface controller — no MVC view is ever rendered from it
(Constitution Principle I).

## `POST /api/contact`

**Request body** (`application/json`):

```json
{
  "name": "string, required, 2-100 chars",
  "email": "string, required, valid email format",
  "subject": "string, required, 3-150 chars",
  "message": "string, required, 10-2000 chars"
}
```

**Success — 201 Created**

```json
{
  "status": "success",
  "submittedAt": "2026-09-19T14:32:00Z"
}
```

No submission identifier or content is echoed back to the caller — the record is
backoffice-review-only (spec FR-015); the public caller only needs confirmation that it landed.

**Validation failure — 400 Bad Request**

```json
{
  "status": "validationError",
  "errors": {
    "email": ["A valid email address is required."],
    "message": ["Message must be between 10 and 2000 characters."]
  }
}
```

One entry per invalid field (spec Scenario 2: "field-specific validation errors"); nothing is
stored when any field fails validation.

**No abuse protection**: per the spec's Clarifications, this endpoint has no rate limiting,
CAPTCHA, or similar throttling in this demo — validation above is the only gate.

## Storage

On success, the controller creates a `contactSubmission` content node (data-model.md) as a child
of the single `Contact Submissions` (`contactSubmissionsContainer`) node via `IContentService`,
and saves + publishes it immediately (there is no Draft/Pending state for submissions — they exist
solely to be listed in the backoffice content list view, per spec FR-014 and the project
constitution's Draft → Publish-only rule not applying additional gates here since nothing about a
submission is ever shown publicly). The node's built-in create date serves as `submittedDate`.
