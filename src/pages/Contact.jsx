import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')

  async function handleSubmit() {
    if (!name || !email || !message) {
      setStatus('Please fill in all fields.')
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
    <div className="max-w-xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl mb-8">Get in touch</h1>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />
        <textarea
          placeholder="Your message"
          rows="5"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />
        <button
          onClick={handleSubmit}
          className="bg-neutral-900 text-white px-8 py-3 rounded-full text-sm hover:bg-neutral-700 transition-colors"
        >
          Send message
        </button>
        {status && <p className="text-sm text-neutral-500">{status}</p>}
      </div>
    </div>
  )
}

export default Contact