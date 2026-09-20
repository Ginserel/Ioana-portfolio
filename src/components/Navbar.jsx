import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

// One place to define the links, so the row and the menu can't drift apart
const LINKS = [
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

function Navbar() {
  const [session, setSession] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

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

  // Escape closes it, the way every other menu on the web does
  useEffect(() => {
    if (!menuOpen) return
    function onKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <nav className="relative flex items-center justify-between gap-4 px-6 md:px-10 py-5">
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.svg" alt="" className="h-7 w-7 shrink-0" />
        <span className="font-display text-lg tracking-tight">Ioana Dobrin</span>
      </Link>

      {/* Wide screens: the links sit out in the open */}
      <div className="hidden md:flex gap-8 text-sm items-center text-neutral-600">
        {LINKS.map((link) => (
          <Link key={link.to} to={link.to} className="hover:text-accent transition-colors">
            {link.label}
          </Link>
        ))}
        {session && (
          <Link
            to="/admin"
            className="bg-accent text-white px-3 py-1.5 rounded-full text-xs"
          >
            Admin
          </Link>
        )}
      </div>

      {/* Narrow screens: a menu button, so the links can't crowd the name */}
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="site-menu"
        className="md:hidden -mr-2 flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 transition-colors hover:text-accent"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
          <circle cx="10" cy="4" r="1.6" />
          <circle cx="10" cy="10" r="1.6" />
          <circle cx="10" cy="16" r="1.6" />
        </svg>
      </button>

      {menuOpen && (
        <>
          {/* Tapping anywhere else closes it */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setMenuOpen(false)}
            className="md:hidden fixed inset-0 z-10 cursor-default"
          />
          <div
            id="site-menu"
            className="md:hidden absolute right-6 top-full z-20 min-w-44 border border-neutral-900/10 bg-paper py-2 shadow-sm"
          >
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="block px-5 py-3 text-sm text-neutral-600 transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
            {session && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="mt-1 block border-t border-neutral-900/10 px-5 py-3 text-sm text-accent"
              >
                Admin
              </Link>
            )}
          </div>
        </>
      )}
    </nav>
  )
}

export default Navbar
