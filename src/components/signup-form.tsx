import { useState, type SyntheticEvent } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm() {
  const [submitted, setSubmitted] = useState(false)
  const [consent, setConsent] = useState(false)

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="signup-card">
      <span className="form-step">01 / SUA INSCRIÇÃO</span>
      <h3>Vem construir com a gente.</h3>
      <p className="form-intro">É rápido. É gratuito. É mão na massa.</p>
      <form onSubmit={handleSubmit} className="mt-5">
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
            disabled={submitted || !consent}
          >
            {submitted
              ? "INSCRIÇÕES PELO GRUPO"
              : "GARANTIR MINHA VAGA GRATUITA"}
          </Button>
        </FieldGroup>
      </form>
      {submitted ? (
        <p className="form-message" role="status">
          As inscrições pelo formulário ainda não estão disponíveis. Entre pelo
          grupo oficial abaixo.
        </p>
      ) : null}
      <p className="fallback">
        O cadastro está temporariamente indisponível. Você pode{" "}
        <a
          href="https://chat.whatsapp.com/Hn0NSEg1YHg3LnfsD3fAWb"
          target="_blank"
          rel="noreferrer"
        >
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
    </div>
  )
}
