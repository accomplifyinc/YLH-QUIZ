// netlify/functions/subscribe.js
// Your Life, Handled Quiz — EmailJS notifications + Flodesk subscriber

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // ── CREDENTIALS ─────────────────────────────────────────────
  const FLODESK_API_KEY    = "fd_key_7d081ce9434f4ebfb7b8cad8e3cf4173.P2p1DTTemJuqRCta6Q5us2qrYwK5XUGB3Ri42KZ6ACyjrbC6x4A8YhWzP3vUHzaX27rr7uvrJpLfsbMsyNlRjCHKjTNsIVcIO7El4sC1hpWOguitWeoYld48UGv4UlsxpOTGFGRzWLnkI3xC9fssF3hOIHlUYW7HOmZAMhXjUmLr5GPQiZncklAynDfW50dB";
  const EMAILJS_PUBLIC_KEY = "Y1XSQ-zODKTu5FRV-";
  const EMAILJS_SERVICE_ID = "service_vdy28qv";
  const EMAILJS_LEAD_TEMPLATE  = "template_0qea55c";
  const EMAILJS_ADMIN_TEMPLATE = "template_kul8shj";
  const ADMIN_EMAIL = "Accomplify.inc@gmail.com";
  const SEG_HANDLED_QUIZ = "6a1f6faae2bcd384135a95d8";
  const BUNDLE_LINK = "https://shop.beacons.ai/facelessdigitalauntie/17e2c7ba-8e08-4a03-9576-1b5d850edcd1";

  // ── PARSE BODY ───────────────────────────────────────────────
  let body;
  try { body = JSON.parse(event.body); }
  catch (e) { return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const { email, first_name, matched_planner } = body;
  if (!email || !first_name) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };
  }

  const PRODUCT_NAMES = {
    birthday:   "Your Birthday Party, Handled",
    fathersday: "Your Father's Day, Handled",
    trip:       "Your Trip, Handled",
  };
  const product_name = PRODUCT_NAMES[matched_planner] || "Your Life, Handled";

  const PRODUCT_DETAILS = {
    birthday: {
      description: "No more sticky notes or tabs open. The whole celebration in one place.",
      contents:    "Guest list &amp; RSVPs · Checklist · Food &amp; cake · Shopping list · Budget dashboard",
      buy_link:    "https://shop.beacons.ai/facelessdigitalauntie/3aa9cf96-6bdd-4b28-89b6-924807806478",
    },
    fathersday: {
      description: "No more last-minute scrambling. The plan, the people, the food, the budget.",
      contents:    "Checklist · Guests &amp; RSVPs · Menu &amp; drinks · Shopping list · Budget dashboard",
      buy_link:    "https://shop.beacons.ai/facelessdigitalauntie/84f72236-5a40-4973-a3e2-dac3043b86ca",
    },
    trip: {
      description: "No more tabs or notes app spirals. The whole journey in one place.",
      contents:    "To-dos · Route &amp; stops · Bookings · Packing list · Budget dashboard",
      buy_link:    "https://shop.beacons.ai/facelessdigitalauntie/63dc8dfd-0ab2-4603-9003-73e86d2fbde1",
    },
  };

  const details = PRODUCT_DETAILS[matched_planner] || PRODUCT_DETAILS.birthday;

  const message = `<p style="margin:0 0 8px;font-family:Georgia,serif;font-size:22px;font-weight:700;color:#0d2140;">Hi ${first_name},</p>
<p style="margin:0 0 20px;font-size:14px;color:#8a948f;">Your quiz match is here.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf3dc;border:2px solid #c9972b;border-radius:12px;margin-bottom:20px;">
<tr><td style="padding:18px 20px;">
<p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#c9972b;">YOUR MATCH</p>
<p style="margin:0 0 8px;font-family:Georgia,serif;font-size:20px;font-weight:700;color:#0d2140;">${product_name}</p>
<p style="margin:0;font-size:13px;color:#3a3228;">${details.description}</p>
</td></tr></table>
<p style="margin:0 0 8px;font-family:Georgia,serif;font-size:15px;font-weight:700;color:#0d2140;">What's inside</p>
<p style="margin:0 0 20px;font-size:13px;color:#3a3228;">${details.contents}</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
<tr><td align="center"><a href="${details.buy_link}" style="display:inline-block;background:#9c3567;color:#fff;font-family:Helvetica,sans-serif;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:40px;">Get it for $9 &rarr;</a></td></tr>
</table>
<p style="margin:0 0 4px;font-size:12px;color:#8a948f;">&#10003; Works on your phone, iPad, or laptop</p>
<p style="margin:0 0 4px;font-size:12px;color:#8a948f;">&#10003; No app, no login &mdash; saves automatically</p>
<p style="margin:0 0 20px;font-size:12px;color:#8a948f;">&#10003; $9 &middot; instant download &middot; yours to reuse every year</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;border-radius:10px;">
<tr><td style="padding:16px 18px;">
<p style="margin:0 0 4px;font-family:Georgia,serif;font-size:14px;font-weight:700;color:#0d2140;">More things coming up this year?</p>
<p style="margin:0 0 10px;font-size:12px;color:#3a3228;">Get all three planners &mdash; birthday, trip, Father&rsquo;s Day &mdash; for $19.</p>
<a href="${BUNDLE_LINK}" style="display:inline-block;background:#0d2140;color:#fff;font-family:Helvetica,sans-serif;font-size:12px;font-weight:600;text-decoration:none;padding:9px 18px;border-radius:6px;">See the Collection &rarr;</a>
</td></tr></table>`;

  const headers = { "Access-Control-Allow-Origin": "*" };

  // ── 1. EMAILJS LEAD EMAIL ────────────────────────────────────
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_LEAD_TEMPLATE,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: { first_name, email, product_name, message, to_email: email }
      })
    });
    console.log("Lead email:", res.status, await res.text());
  } catch (e) { console.error("Lead email error:", e.message); }

  // ── 2. EMAILJS ADMIN NOTIFICATION ───────────────────────────
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_ADMIN_TEMPLATE,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: { first_name, email, product_name, to_email: ADMIN_EMAIL }
      })
    });
    console.log("Admin email:", res.status, await res.text());
  } catch (e) { console.error("Admin email error:", e.message); }

  // ── 3. FLODESK (non-blocking, fire and forget) ───────────────
  fetch("https://api.flodesk.com/v1/subscribers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic " + Buffer.from(FLODESK_API_KEY + ":").toString("base64")
    },
    body: JSON.stringify({
      email, first_name,
      segment_ids: [SEG_HANDLED_QUIZ],
      custom_fields: { matched_planner: matched_planner || "birthday" }
    })
  }).catch(e => console.error("Flodesk:", e.message));
  // Note: Flodesk is fire-and-forget — we don't await it
  // so it never blocks the response or causes a timeout

  return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
};
