import { useState, type SyntheticEvent } from "react"
import { FaWhatsapp } from "react-icons/fa"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

const WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/DSzUr0IE5SiKbENeP0RItT?s=cl&p=i&mlu=4&ilr=4&utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAcGRvZgJleHRuA2FlbQMxMDAAc3J0YwZhcHBfaWQPOTM2NjE5NzQzMzkyNDU5AAGnnFy9AxbB90ZYmHhEQqJldTl7RQS2lzujJ6btXEz2tpa1aGykRNNtHsFtl8Y_aem_tm5D1efs0D5cYvW2kPVZ9A"

export function SignupForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [consent, setConsent] = useState(false)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting || submitted) return

    setSubmitting(true)
    setError("")

    const form = event.currentTarget
    const formData = new FormData(form)
    const url = new URL(window.location.href)
    const attributionKeys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "fbclid",
      "gclid",
    ] as const

    const attribution = Object.fromEntries(
      attributionKeys.map((key) => {
        const currentValue = url.searchParams.get(key)
        const storageKey = `lead_attribution_${key}`

        if (currentValue) sessionStorage.setItem(storageKey, currentValue)

        return [key, currentValue ?? sessionStorage.getItem(storageKey) ?? ""]
      }),
    )

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          website: formData.get("website"),
          consent,
          page_url: url.href,
          ...attribution,
        }),
      })

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(result?.error ?? "Não foi possível concluir sua inscrição.")
      }

      window.dataLayer = window.dataLayer ?? []
      window.dataLayer.push({
        event: "lead_form_submitted",
        form_name: "live_claude_code",
        lead_source: attribution.utm_source || "direct",
      })

      setSubmitted(true)
      setJoinDialogOpen(true)
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Não foi possível concluir sua inscrição.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="signup-card">
      <span className="form-step">01 / SUA INSCRIÇÃO</span>
      <h3>Vem construir com a gente.</h3>
      <p className="form-intro">É rápido. É gratuito. É mão na massa.</p>
      <form onSubmit={handleSubmit} className="mt-5">
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="website">Não preencha este campo</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Seu nome</FieldLabel>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Como podemos te chamar?"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Seu WhatsApp com DDD</FieldLabel>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              required
            />
            <FieldDescription>
              Use um número brasileiro com DDD.
            </FieldDescription>
          </Field>
          <Field orientation="horizontal">
            <Checkbox
              id="consent"
              name="consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked === true)}
              required
            />
            <FieldLabel htmlFor="consent">
              Concordo em receber os avisos e o acesso a este aulão pelo
              WhatsApp.
            </FieldLabel>
          </Field>
          <Button
            className="w-full"
            variant="shiny"
            size="hero"
            type="submit"
            disabled={submitting || submitted || !consent}
          >
            {submitting
              ? "CONFIRMANDO SUA VAGA..."
              : submitted
                ? "CONTINUE NO WHATSAPP"
                : "GARANTIR MINHA VAGA GRATUITA"}
          </Button>
        </FieldGroup>
      </form>
      {error ? (
        <p className="form-message" role="alert">
          {error} Tente novamente em instantes.
        </p>
      ) : null}
      {submitted ? (
        <p className="form-message" role="status">
          Próximo passo: entre no grupo oficial para receber os avisos da live.
        </p>
      ) : null}
      <p className="fallback">
        Já se cadastrou? Você também pode{" "}
        <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noreferrer">
          entrar diretamente no grupo
        </a>{" "}
        para acompanhar a live.
      </p>
      <details className="privacy">
        <summary>Como usamos seus dados</summary>
        <p>
          Rodrigo Custódio e sua equipe usam seu nome e WhatsApp para organizar
          sua inscrição e enviar informações sobre este aulão.
        </p>
      </details>
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="whatsapp-dialog sm:max-w-md">
          <div className="whatsapp-dialog-accent" aria-hidden="true" />
          <DialogHeader className="items-center text-center">
            <div className="whatsapp-dialog-icon" aria-hidden="true">
              <FaWhatsapp />
            </div>
            <p className="whatsapp-dialog-kicker">ÚLTIMO PASSO</p>
            <DialogTitle>ENTRE NO GRUPO OFICIAL</DialogTitle>
            <DialogDescription>
              É no WhatsApp que você vai receber o link da live e os avisos para
              não perder o aulão.
            </DialogDescription>
          </DialogHeader>
          <p className="whatsapp-dialog-note">
            Grupo gratuito · somente avisos importantes
          </p>
          <DialogFooter className="sm:justify-stretch">
            <Button variant="whatsapp" size="hero" className="w-full" asChild>
              <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noreferrer">
                <FaWhatsapp data-icon="inline-start" />
                ENTRAR NO GRUPO DO WHATSAPP
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
