const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function createMailer({
  resendApiKey = process.env.RESEND_API_KEY || "",
  fromAddress = process.env.MAIL_FROM_ADDRESS || "PEM <noreply@pem.local>",
  brandName = process.env.MAIL_BRAND_NAME || "Precious Events Makers",
} = {}) {
  const enabled = Boolean(resendApiKey);

  async function sendViaResend({ to, subject, html, text }) {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fromAddress, to, subject, html, text }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Resend send failed (${response.status}): ${detail.slice(0, 240)}`);
    }
  }

  async function send({ to, subject, html, text }) {
    if (!to) return { ok: false, skipped: true, reason: "missing-recipient" };
    if (!subject) return { ok: false, skipped: true, reason: "missing-subject" };

    if (!enabled) {
      console.log(`[mailer:dev] Suppressed email to ${to} | subject="${subject}" | text="${(text || "").slice(0, 200)}"`);
      return { ok: true, skipped: true, reason: "no-provider" };
    }

    try {
      await sendViaResend({ to, subject, html, text });
      return { ok: true, skipped: false };
    } catch (error) {
      console.error("[mailer] send failed:", error.message);
      return { ok: false, skipped: false, error: error.message };
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function template(title, intro, ctaLabel, ctaUrl, footer = "") {
    const safeTitle = escapeHtml(title);
    const safeIntro = escapeHtml(intro);
    const safeFooter = escapeHtml(footer);
    const button = ctaLabel && ctaUrl
      ? `<p style="margin:24px 0;"><a href="${escapeHtml(ctaUrl)}" style="background:#9c2a2a;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;">${escapeHtml(ctaLabel)}</a></p>`
      : "";
    return `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;background:#faf7f4;padding:24px;color:#2a1d18;">
<div style="max-width:560px;margin:auto;background:#fff;border-radius:14px;padding:28px;box-shadow:0 12px 32px rgba(64,32,16,0.08);">
  <h2 style="margin:0 0 12px;color:#7a1f1f;">${safeTitle}</h2>
  <p style="line-height:1.55;margin:0 0 14px;">${safeIntro}</p>
  ${button}
  ${safeFooter ? `<p style="font-size:13px;color:#6b524a;margin-top:18px;">${safeFooter}</p>` : ""}
  <p style="font-size:12px;color:#94776c;margin-top:24px;">${escapeHtml(brandName)}</p>
</div></body></html>`;
  }

  return {
    enabled,
    send,
    sendVerificationEmail({ to, link }) {
      return send({
        to,
        subject: `Verify your ${brandName} email`,
        text: `Welcome to ${brandName}. Confirm your email by visiting: ${link}\nThis link expires in 24 hours.`,
        html: template(
          "Confirm your email",
          `Welcome to ${brandName}. Tap the button to verify this email address — the link expires in 24 hours.`,
          "Verify email",
          link,
          "If you did not create a PEM account, you can ignore this message.",
        ),
      });
    },
    sendPasswordResetEmail({ to, link }) {
      return send({
        to,
        subject: `${brandName} password reset`,
        text: `A password reset was requested for your PEM account. Visit: ${link}\nThis link expires in 30 minutes.`,
        html: template(
          "Reset your PEM password",
          "We received a request to reset the password on your PEM account. The link expires in 30 minutes.",
          "Reset password",
          link,
          "If you did not request this, you can ignore the email — your password stays the same.",
        ),
      });
    },
    sendOrderConfirmation({ to, customerName, reference, total, etaLabel }) {
      const safeTotal = Number(total || 0).toLocaleString("en-NG");
      return send({
        to,
        subject: `${brandName} order ${reference}`,
        text: `Hi ${customerName}, PEM received your order ${reference}. Total: NGN ${safeTotal}. ${etaLabel || ""}`.trim(),
        html: template(
          `Order ${reference} received`,
          `Hi ${customerName}, your order is in. PEM will get to work right away.`,
          "",
          "",
          `Total: NGN ${safeTotal}. ${etaLabel || ""}`,
        ),
      });
    },
    sendGiftRecipientNotice({ to, recipientName, senderName, link }) {
      return send({
        to,
        subject: `${senderName} sent you a meal on ${brandName}`,
        text: `Hi ${recipientName}, ${senderName} sent you a meal gift on ${brandName}. Accept it here: ${link}`,
        html: template(
          `${escapeHtml(senderName)} sent you a meal`,
          `Hi ${recipientName}, ${senderName} just sent you a gift through ${brandName}. Accept the gift to choose your delivery address.`,
          "Open my gift",
          link,
        ),
      });
    },
  };
}
