# 🔒 Security Policy

## Supported Versions

The following table outlines which versions of **FrameX** are actively supported with security updates:

| Version | Supported       |
| ------- | --------------- |
| 1.0.0   | ✅ Full Support  |
| < 1.0.0 | ❌ Not Supported |

---

## Reporting a Vulnerability

We take security very seriously and appreciate the efforts of the community to responsibly disclose vulnerabilities.

If you discover a security issue in **FrameX**, please report it through the following channel:

* 📧 Email: **[support@hytek.org.in](mailto:support@hytek.org.in)** (replace with your project’s security contact)
* 🔒 Use [PGP/GPG encryption](https://gnupg.org) for sensitive reports (provide a public key if available).

---

## Disclosure Policy

1. **Initial Response** – We will acknowledge receipt of your report within **48 hours**.
2. **Assessment** – Our team will investigate the issue, assess impact, and determine affected versions.
3. **Remediation** – A fix will be developed, tested, and prepared for release.
4. **Advisory** – Once the fix is available, we will publish a **Security Advisory** with details, mitigation steps, and credit to the reporter (if desired).

---

## Scope

The security team is responsible for vulnerabilities affecting:

* Authentication & authorization flows (Google/GitHub OAuth, password management).
* API endpoints and backend services (Laravel).
* Frontend security (React + TypeScript, XSS/CSRF protection).
* Data handling, encryption, and storage practices.
* Build and deployment scripts (to prevent supply-chain attacks).

---

## Best Practices for Users

To keep your application secure while using **FrameX**, we recommend:

* Always run the **latest supported version**.
* Regularly update dependencies (`composer update`, `npm/yarn update`).
* Enable **HTTPS** in production.
* Configure environment variables securely (`.env` should never be committed).
* Use a **Web Application Firewall (WAF)** and follow the **OWASP Top 10** guidelines.

---

## Responsible Disclosure

We kindly ask that you **do not publicly disclose** a vulnerability before:

* Coordinating with us.
* Giving us reasonable time (typically **90 days**) to address the issue.




