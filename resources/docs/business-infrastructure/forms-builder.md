---
title: Dynamic Forms Builder
slug: forms-builder
description: Build, embed, and validate custom dynamic forms with zero backend boilerplate.
category: Business Infrastructure
order: 1
---

# Dynamic Forms Builder

The FrameX Forms Engine empowers administrators to design custom lead capture, quote request, and feedback forms visually without writing custom migrations or controllers.

---

## Form Schema Definition

Each form is stored in the `forms` table with a flexible JSON field schema:

```json
[
  { "name": "full_name", "label": "Full Name", "type": "text", "required": true },
  { "name": "email", "label": "Work Email", "type": "email", "required": true },
  { "name": "budget", "label": "Project Budget", "type": "select", "options": ["<$10k", "$10k-$50k", "$50k+"] },
  { "name": "message", "label": "Project Scope", "type": "textarea", "required": true }
]
```

---

## Embedding Forms in React

Forms can be embedded into any public page or marketing layout using the `<DynamicForm />` component:

```tsx
import { DynamicForm } from '@/components/forms/DynamicForm';

export default function ContactPage() {
    return (
        <DynamicForm
            slug="contact-quote"
            fields={formFields}
            submitButtonText="Send Proposal"
            successMessage="Thank you! We will review your project within 24 hours."
        />
    );
}
```

---

## Submission Processing & Security

1. **Honeypot Anti-Spam:** An invisible field (`_hp_verify`) is evaluated automatically. If populated by an automated bot, submission is rejected instantly.
2. **Server-Side Validation:** `FormService` validates field types, required constraints, email formats, and string lengths dynamically.
3. **Audit Records:** Submissions are saved to `form_submissions` with the client's anonymized IP, user agent, and payload.
4. **CSV Export:** Administrators can export submission records to CSV directly from the management console.
