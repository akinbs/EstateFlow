import { useState } from 'react'
import { Mail, Phone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { createLead } from '../../services/api/leadApi'
import Button from '../ui/Button'

interface ContactLeadFormProps {
  propertyId: string
  propertyTitle: string
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

export default function ContactLeadForm({ propertyId, propertyTitle }: ContactLeadFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState(
    `Merhaba, "${propertyTitle}" ilanı hakkında bilgi almak istiyorum.`,
  )
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!name.trim()) errs.name = 'Ad Soyad zorunludur'
    if (!email.trim()) {
      errs.email = 'E-posta zorunludur'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Geçerli bir e-posta adresi girin'
    }
    if (!message.trim()) errs.message = 'Mesaj zorunludur'
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setStatus('loading')
    try {
      await createLead({
        propertyId,
        propertyTitle,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim(),
      })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">Mesajınız iletildi!</p>
          <p className="mt-1 text-xs text-slate-500">En kısa sürede sizinle iletişime geçeceğiz.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      {/* Name */}
      <div>
        <input
          type="text"
          placeholder="Ad Soyad *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full rounded-xl border px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <input
          type="email"
          placeholder="E-posta Adresi *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full rounded-xl border px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <input
        type="tel"
        placeholder="Telefon (isteğe bağlı)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />

      {/* Message */}
      <div>
        <textarea
          rows={3}
          placeholder="Mesajınız *"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`w-full resize-none rounded-xl border px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            errors.message ? 'border-red-300 bg-red-50' : 'border-slate-200'
          }`}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-500">{errors.message}</p>
        )}
      </div>

      {/* Error banner */}
      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-600">
          <AlertCircle size={14} className="shrink-0" />
          Mesaj gönderilemedi. Lütfen tekrar deneyin.
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={status === 'loading'}
        className="w-full gap-2"
      >
        {status === 'loading' ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Mail size={15} />
        )}
        {status === 'loading' ? 'Gönderiliyor…' : 'Mesaj Gönder'}
      </Button>

      <Button variant="outline" size="md" type="button" className="w-full gap-2">
        <Phone size={15} />
        Ara
      </Button>
    </form>
  )
}
