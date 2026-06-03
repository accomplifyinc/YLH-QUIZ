// netlify/functions/subscribe.js
// Your Life, Handled Quiz — Flodesk subscriber + EmailJS notifications
// Runs server-side so Flodesk's CORS restrictions never apply.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // ── CREDENTIALS ─────────────────────────────────────────────
  const FLODESK_API_KEY = "fd_key_7d081ce9434f4ebfb7b8cad8e3cf4173.P2p1DTTemJuqRCta6Q5us2qrYwK5XUGB3Ri42KZ6ACyjrbC6x4A8YhWzP3vUHzaX27rr7uvrJpLfsbMsyNlRjCHKjTNsIVcIO7El4sC1hpWOguitWeoYld48UGv4UlsxpOTGFGRzWLnkI3xC9fssF3hOIHlUYW7HOmZAMhXjUmLr5GPQiZncklAynDfW50dB";

  // EmailJS — same account as FDA quiz
  const EMAILJS_PUBLIC_KEY  = "Y1XSQ-zODKTu5FRV-";
  const EMAILJS_SERVICE_ID  = "service_vdy28qv";
  // Create these two templates in EmailJS (see instructions):
  const EMAILJS_LEAD_TEMPLATE  = "PASTE_YLH_LEAD_TEMPLATE_ID";   // email to the quiz taker
  const EMAILJS_ADMIN_TEMPLATE = "PASTE_YLH_ADMIN_TEMPLATE_ID";  // notification to you
  const ADMIN_EMAIL = "Accomplify.inc@gmail.com";

  // ── SEGMENT ─────────────────────────────────────────────────
  const SEG_HANDLED_QUIZ = "6a1f6faae2bcd384135a95d8";

  // ── PARSE BODY ───────────────────────────────────────────────
  let body;
  try { body = JSON.parse(event.body); }
  catch (e) { return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const { email, first_name, matched_planner } = body;
  if (!email || !first_name) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing email or name" }) };
  }

  // Friendly product name for emails
  const PRODUCT_NAMES = {
    birthday:   "Your Birthday Party, Handled",
    fathersday: "Your Father's Day, Handled",
    trip:       "Your Trip, Handled",
  };
  const product_name = PRODUCT_NAMES[matched_planner] || "Your Life, Handled";

  // Product-specific details for the email body
  // UPDATE buy_link values once your Beacons products are live
  const PRODUCT_DETAILS = {
    birthday: {
      description: "No more sticky notes, no more tabs open, no more carrying it all in your head. The whole celebration in one place.",
      contents:    "✓ &nbsp; Guest list &amp; RSVPs<br>✓ &nbsp; Full checklist from weeks out to the big day<br>✓ &nbsp; Food &amp; cake planning<br>✓ &nbsp; Categorized shopping list<br>✓ &nbsp; Planned-vs-spent budget with dashboard",
      buy_link:    "https://shop.beacons.ai/facelessdigitalauntie/3aa9cf96-6bdd-4b28-89b6-924807806478",
    },
    fathersday: {
      description: "No more last-minute scrambling. The guests, the food, the budget — all in one place so you can actually enjoy it.",
      contents:    "✓ &nbsp; Checklist from weeks out to the day<br>✓ &nbsp; Guest list with RSVPs<br>✓ &nbsp; Menu &amp; drinks planning<br>✓ &nbsp; Shopping list<br>✓ &nbsp; Planned-vs-spent budget with dashboard",
      buy_link:    "https://shop.beacons.ai/facelessdigitalauntie/84f72236-5a40-4973-a3e2-dac3043b86ca",
    },
    trip: {
      description: "No more tabs, no more notes app, no more 3am 'did I book the hotel' spiral. The whole journey in one place. Drive or fly.",
      contents:    "✓ &nbsp; To-do list with sub-steps<br>✓ &nbsp; Route &amp; stops (editable)<br>✓ &nbsp; Bookings tracker with confirmation numbers<br>✓ &nbsp; Packing list<br>✓ &nbsp; Planned-vs-spent budget with dashboard",
      buy_link:    "https://shop.beacons.ai/facelessdigitalauntie/63dc8dfd-0ab2-4603-9003-73e86d2fbde1",
    },
  };

  const details = PRODUCT_DETAILS[matched_planner] || PRODUCT_DETAILS.birthday;
  const BUNDLE_LINK = "https://shop.beacons.ai/facelessdigitalauntie/17e2c7ba-8e08-4a03-9576-1b5d850edcd1";

  // Build the {{{message}}} HTML — this drops into your EmailJS template
  const message = `
    <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;color:#0d2140;line-height:1.15;">Hi ${first_name},</p>
    <p style="margin:0 0 26px;font-size:15px;color:#9a8e84;line-height:1.5;">Your quiz match is here. Here's everything you need.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf3dc;border:2px solid #c9972b;border-radius:14px;margin-bottom:24px;">
      <tr><td style="padding:22px 24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#c9972b;">Your match</p>
        <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#0d2140;">${product_name}</p>
        <p style="margin:0;font-size:14px;color:#3a3228;line-height:1.6;">${details.description}</p>
      </td></tr>
    </table>
    <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:700;color:#0d2140;">What's in it</p>
    <p style="margin:0 0 24px;font-size:14px;color:#3a3228;line-height:1.8;">${details.contents}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr><td align="center">
        <a href="${details.buy_link}" style="display:inline-block;background:linear-gradient(135deg,#9c3567,#7a2852);color:#fff;font-family:Helvetica,sans-serif;font-size:16px;font-weight:700;text-decoration:none;padding:15px 36px;border-radius:50px;">Get it for $9 &rarr;</a>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td style="height:1px;background:#ede4d8;"></td></tr></table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="padding:4px 0;font-size:13px;color:#9a8e84;">✓ &nbsp; Works on your phone, iPad, or laptop</td></tr>
      <tr><td style="padding:4px 0;font-size:13px;color:#9a8e84;">✓ &nbsp; No app, no login — saves automatically</td></tr>
      <tr><td style="padding:4px 0;font-size:13px;color:#9a8e84;">✓ &nbsp; $9 · instant download · yours to reuse every year</td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;border-radius:12px;">
      <tr><td style="padding:18px 20px;">
        <p style="margin:0 0 5px;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:700;color:#0d2140;">More things coming up this year?</p>
        <p style="margin:0 0 12px;font-size:13px;color:#3a3228;line-height:1.55;">Get the whole <em>Your Life, Handled</em> Collection — your birthday, your trip, your Father's Day, all of it handled. One price, all year.</p>
        <a href="${BUNDLE_LINK}" style="display:inline-block;background:#0d2140;color:#fff;font-family:Helvetica,sans-serif;font-size:13px;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:8px;">See the Collection &rarr;</a>
      </td></tr>
    </table>
  `;

  // ── 1. ADD TO FLODESK ────────────────────────────────────────
  try {
    await fetch("https://api.flodesk.com/v1/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + Buffer.from(FLODESK_API_KEY + ":").toString("base64")
      },
      body: JSON.stringify({
        email,
        first_name,
        segment_ids: [SEG_HANDLED_QUIZ],
        custom_fields: { matched_planner: matched_planner || "birthday" }
      })
    });
  } catch (err) {
    console.error("Flodesk error:", err);
    // Don't block — continue to emails even if Flodesk has issues
  }

  // ── 2. EMAIL TO LEAD (delivery + match result) ───────────────
  // Template variables available in your EmailJS lead template:
  //   {{first_name}}      → their first name
  //   {{email}}           → their email
  //   {{product_name}}    → e.g. "Your Birthday Party, Handled"
  //   {{matched_planner}} → birthday / fathersday / trip
  try {
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id:  EMAILJS_SERVICE_ID,
        template_id: EMAILJS_LEAD_TEMPLATE,
        user_id:     EMAILJS_PUBLIC_KEY,
        template_params: {
          first_name,
          email,
          product_name,
          matched_planner: matched_planner || "birthday",
          message,           // the {{{message}}} block in your EmailJS template
          to_email: email,
        }
      })
    });
  } catch (err) {
    console.error("EmailJS lead email error:", err);
  }

  // ── 3. ADMIN NOTIFICATION TO YOU ────────────────────────────
  // Template variables available in your EmailJS admin template:
  //   {{first_name}}      → lead's name
  //   {{email}}           → lead's email
  //   {{product_name}}    → which planner they matched
  //   {{matched_planner}} → birthday / fathersday / trip
  try {
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id:  EMAILJS_SERVICE_ID,
        template_id: EMAILJS_ADMIN_TEMPLATE,
        user_id:     EMAILJS_PUBLIC_KEY,
        template_params: {
          first_name,
          email,
          product_name,
          matched_planner: matched_planner || "birthday",
          to_email: ADMIN_EMAIL,
        }
      })
    });
  } catch (err) {
    console.error("EmailJS admin email error:", err);
  }

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ success: true })
  };
};

