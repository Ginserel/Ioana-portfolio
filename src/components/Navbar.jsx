import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function Navbar() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <nav className="flex items-center justify-between px-6 md:px-10 py-5">
      <Link to="/" className="font-display text-lg tracking-tight">
        Ioana Dobrin
      </Link>
      <div className="flex gap-5 md:gap-8 text-sm items-center text-neutral-600">
        <Link to="/gallery" className="hover:text-neutral-900 transition-colors">Gallery</Link>
        <Link to="/about" className="hover:text-neutral-900 transition-colors">About</Link>
        <Link to="/contact" className="hover:text-neutral-900 transition-colors">Contact</Link>
        {session && (
          <Link
            to="/admin"
            className="bg-neutral-900 text-white px-3 py-1.5 rounded-full text-xs"
          >
            Admin
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar