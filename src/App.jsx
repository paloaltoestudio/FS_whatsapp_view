import { useState } from 'react'
import Stepper from './components/Stepper.jsx'
import DocumentStep from './components/DocumentStep.jsx'
import SignatureStep from './components/SignatureStep.jsx'
import OtpStep from './components/OtpStep.jsx'
import SuccessStep from './components/SuccessStep.jsx'

// ?sinotp in the URL skips the OTP verification screen entirely.
// ?hash / ?uuid come from the WhatsApp link and identify the signature process.
const params = new URLSearchParams(window.location.search)
const skipOtp = params.has('sinotp')
const signatureHash = params.get('hash') || ''

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
            skipOtp={skipOtp}
            onBack={() => goTo(1)}
            onNext={() => goTo(skipOtp ? 4 : 3)}
          />
        )}
        {step === 3 && !skipOtp && (
          <OtpStep signatureHash={signatureHash} onConfirm={() => goTo(4)} />
        )}
        {step === 4 && <SuccessStep />}
      </div>
    </div>
  )
}
