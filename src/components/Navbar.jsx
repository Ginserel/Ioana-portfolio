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
    <nav className="flex items-center justify-between px-6 py-4 border-b">
      <span className="font-medium">Ioana Dobrin</span>
      <div className="flex gap-6 text-sm items-center">
        <Link to="/">Home</Link>
        <Link to="/gallery">Gallery</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        {session && (
          <Link
            to="/admin"
            className="bg-black text-white px-3 py-1 rounded-lg"
          >
            Admin
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar