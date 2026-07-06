import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin() {
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Invalid email or password.')
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="text-2xl font-bold mb-6">Admin login</h1>
      <div className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />
        <button
          onClick={handleLogin}
          className="bg-black text-white px-6 py-3 rounded-lg"
        >
          Log in
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}

export default Login