import type { APIRoute } from "astro"

export const prerender = false

const PHONE_MIN_LENGTH = 10
const PHONE_MAX_LENGTH = 13

function cleanText(value: unknown, maxLength = 255) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : ""
}

function cleanPhone(value: unknown) {
  const digits = cleanText(value, 32).replace(/\D/g, "")
  const withCountryCode = digits.length <= 11 ? `55${digits}` : digits

  return withCountryCode.slice(0, PHONE_MAX_LENGTH)
}

export const POST: APIRoute = async ({ request }) => {
  const contentLength = Number(request.headers.get("content-length") ?? 0)

  if (contentLength > 20_000) {
    return new Response(JSON.stringify({ error: "Payload muito grande." }), {
      status: 413,
      headers: { "content-type": "application/json" },
    })
  }

  let body: Record<string, unknown>

  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: "Dados inválidos." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  if (cleanText(body.website, 200)) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  }

  const name = cleanText(body.name, 120)
  const phone = cleanPhone(body.phone)
  const consent = body.consent === true

  if (
    name.length < 2 ||
    phone.length < PHONE_MIN_LENGTH ||
    phone.length > PHONE_MAX_LENGTH ||
    !consent
  ) {
    return new Response(
      JSON.stringify({ error: "Preencha nome, WhatsApp com DDD e aceite o consentimento." }),
      { status: 422, headers: { "content-type": "application/json" } },
    )
  }

  const webhookUrl = import.meta.env.GHL_LEAD_WEBHOOK_URL

  if (!webhookUrl) {
    console.error("GHL_LEAD_WEBHOOK_URL não configurada")
    return new Response(JSON.stringify({ error: "Integração indisponível." }), {
      status: 503,
      headers: { "content-type": "application/json" },
    })
  }

  const payload = {
    name,
    phone: `+${phone}`,
    source: "LP Live Claude Code",
    form_name: "live_claude_code",
    page_url: cleanText(body.page_url, 500),
    utm_source: cleanText(body.utm_source),
    utm_medium: cleanText(body.utm_medium),
    utm_campaign: cleanText(body.utm_campaign),
    utm_content: cleanText(body.utm_content),
    utm_term: cleanText(body.utm_term),
    fbclid: cleanText(body.fbclid, 500),
    gclid: cleanText(body.gclid, 500),
    consent,
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
    })

    if (!response.ok) {
      console.error("Falha no webhook do HighLevel", response.status)
      return new Response(JSON.stringify({ error: "Não foi possível concluir sua inscrição." }), {
        status: 502,
        headers: { "content-type": "application/json" },
      })
    }
  } catch (error) {
    console.error("Erro ao enviar lead ao HighLevel", error)
    return new Response(JSON.stringify({ error: "Não foi possível concluir sua inscrição." }), {
      status: 502,
      headers: { "content-type": "application/json" },
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}
