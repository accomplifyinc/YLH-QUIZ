// netlify/functions/subscribe.js
// Handles Flodesk only — EmailJS is called browser-side

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const FLODESK_API_KEY  = "fd_key_7d081ce9434f4ebfb7b8cad8e3cf4173.P2p1DTTemJuqRCta6Q5us2qrYwK5XUGB3Ri42KZ6ACyjrbC6x4A8YhWzP3vUHzaX27rr7uvrJpLfsbMsyNlRjCHKjTNsIVcIO7El4sC1hpWOguitWeoYld48UGv4UlsxpOTGFGRzWLnkI3xC9fssF3hOIHlUYW7HOmZAMhXjUmLr5GPQiZncklAynDfW50dB";
  const SEG_HANDLED_QUIZ = "6a1f6faae2bcd384135a95d8";
  const headers          = { "Access-Control-Allow-Origin": "*" };

  let body;
  try { body = JSON.parse(event.body); }
  catch (e) { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const { email, first_name, matched_planner } = body;
  if (!email || !first_name) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing fields" }) };
  }

  try {
    const res = await fetch("https://api.flodesk.com/v1/subscribers", {
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
    });
    console.log("Flodesk:", res.status);
  } catch (e) {
    console.error("Flodesk error:", e.message);
  }

  return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
};
