---
title: Outbound Webhooks & HMAC Signing
slug: webhooks-dispatcher
description: Reliable, event-driven outbound webhooks with HMAC-SHA256 signature verification.
category: Business Infrastructure
order: 2
badge: Infrastructure
---

# Outbound Webhooks & HMAC Signing

FrameX includes an event-driven webhooks engine allowing third-party systems to receive real-time notifications when content is published, reviews are requested, or forms are submitted.

---

## Verifying Webhook Signatures

Every webhook delivery includes an HTTP signature header: `X-FrameX-Signature`.

To verify that the webhook payload originated from FrameX and has not been tampered with:

```php
$signature = $request->header('X-FrameX-Signature');
$payload = $request->getContent();
$secret = 'your_webhook_endpoint_secret';

$computed = hash_hmac('sha256', $payload, $secret);

if (! hash_equals($computed, $signature)) {
    abort(401, 'Invalid signature.');
}
```

---

## Retries & Delivery Logs

If the recipient server returns an error or times out:
- Deliveries are logged in `webhook_deliveries` with HTTP status code, response body, and duration.
- The queue worker automatically backs off with exponential delay before retrying.
- Admins can manually test endpoints using the **Ping Endpoint** action in the dashboard.
