import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Every field shares the same look: a small uppercase label above a line,
// which picks up the accent when you're typing in it.
const fieldClass =
  'bg-transparent border-b border-neutral-900/20 py-3 text-lg outline-none transition-colors focus:border-accent'

function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  // Two cheap spam checks, no third-party service and nothing for a real
  // visitor to do: a field that only a bot would fill in, and the time the
  // page was opened. Bots submit instantly; people take longer than a second.
  const [botField, setBotField] = useState('')
  const openedAt = useRef(null)

  // Recorded after mount rather than during render, which has to stay pure
  useEffect(() => {
    openedAt.current = Date.now()
  }, [])

  async function handleSubmit(event) {
    // It's a real form now, so stop the browser reloading the page
    event.preventDefault()

    if (!name || !email || !message) {
      setStatus('Please fill in all fields.')
      return
    }

    // Look like it worked rather than tell a bot which check caught it
    const tooFast = openedAt.current !== null && Date.now() - openedAt.current < 1500
    if (botField || tooFast) {
      setStatus('Message sent! I will get back to you soon.')
      setName('')
      setEmail('')
      setMessage('')
      return
    }

    const { error } = await supabase
      .from('messages')
      .insert({ name, email, message })

    if (error) {
      console.error('Error sending message:', error)
      setStatus('Something went wrong. Please try again.')
    } else {
      setStatus('Message sent! I will get back to you soon.')
      setName('')
      setEmail('')
      setMessage('')
    }
  }

  return (
    <div className="px-6 md:px-10 pt-10 md:pt-16 pb-20 md:pb-28">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-5 md:mb-6">
          Say hello
        </p>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight mb-12 md:mb-16">
          Get in <em className="italic text-accent">touch.</em>
        </h1>

        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <p className="max-w-sm text-lg text-neutral-600 leading-relaxed">
              Commissions, licensing enquiries, or a question about a piece —
              anything sent here lands in my inbox.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="md:col-span-7 max-w-2xl flex flex-col gap-8">
            <label className="flex flex-col gap-2">
              <span className="text-[0.7rem] uppercase tracking-[0.25em] text-neutral-500">
                Your name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[0.7rem] uppercase tracking-[0.25em] text-neutral-500">
                Your email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </label>

            {/* Hidden from people and from screen readers, so anything that
                fills it in is automated. Off-screen rather than display:none,
                which some bots know to skip. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={botField}
              onChange={(e) => setBotField(e.target.value)}
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />

            <label className="flex flex-col gap-2">
              <span className="text-[0.7rem] uppercase tracking-[0.25em] text-neutral-500">
                Your message
              </span>
              <textarea
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${fieldClass} resize-none`}
              />
            </label>

            <div className="flex flex-wrap items-center gap-5">
              <button
                type="submit"
                className="bg-accent text-white px-8 py-3 rounded-full text-[0.7rem] uppercase tracking-[0.25em] transition-colors hover:bg-[#6f3c24]"
              >
                Send message
              </button>
              {status && <p className="text-sm text-neutral-600">{status}</p>}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Contact
