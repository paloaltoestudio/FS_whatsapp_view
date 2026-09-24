import { useState } from 'react'
import Stepper from './components/Stepper.jsx'
import DocumentStep from './components/DocumentStep.jsx'
import SignatureStep from './components/SignatureStep.jsx'
import OtpStep from './components/OtpStep.jsx'
import SuccessStep from './components/SuccessStep.jsx'

// ?sinotp in the URL skips the OTP verification screen entirely.
//
// The approved WhatsApp template's URL button only supports a single dynamic
// variable, so n8n packs both values we need into one ?hash= param as
// "<signatureHash>.<authenticationMethodId>" (e.g. "9807...-fd56.4"). We split
// it back apart here. `.trim()` guards against a stray leading space we saw
// baked into one sample URL in WhatsApp Manager.
const params = new URLSearchParams(window.location.search)
const skipOtp = params.has('sinotp')
const rawHashParam = (params.get('hash') || '').trim()
const lastDot = rawHashParam.lastIndexOf('.')
const signatureHash = lastDot >= 0 ? rawHashParam.slice(0, lastDot) : rawHashParam
const authMethodParam = lastDot >= 0 ? parseInt(rawHashParam.slice(lastDot + 1), 10) : NaN
const authenticationMethodId = Number.isFinite(authMethodParam) ? authMethodParam : 4

const STEP_LABELS = skipOtp
  ? ['Documento', 'Firma', 'Listo']
  : ['Documento', 'Firma', 'Verificación', 'Listo']

export default function App() {
  const [step, setStep] = useState(1)

  const goTo = (next) => setStep(Math.min(4, Math.max(1, next)))

  const isSuccess = step === 4
  const displayStep = skipOtp && isSuccess ? 3 : step

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-white flex flex-col">
      {!isSuccess && <Stepper step={displayStep} labels={STEP_LABELS} />}

      <div className="flex-1 min-h-0">
        {step === 1 && <DocumentStep onNext={() => goTo(2)} />}
        {step === 2 && (
          <SignatureStep
            signatureHash={signatureHash}
            authenticationMethodId={authenticationMethodId}
            skipOtp={skipOtp}
            onBack={() => goTo(1)}
            onNext={() => goTo(skipOtp ? 4 : 3)}
          />
        )}
        {step === 3 && !skipOtp && (
          <OtpStep
            signatureHash={signatureHash}
            authenticationMethodId={authenticationMethodId}
            onConfirm={() => goTo(4)}
          />
        )}
        {step === 4 && <SuccessStep />}
      </div>
    </div>
  )
}
