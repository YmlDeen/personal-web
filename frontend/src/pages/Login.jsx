import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const login = useAuth(s => s.login)
  const nav = useNavigate()

  const submit = async () => {
    setError('')
    try {
      await login(form.username, form.password)
      nav('/')
    } catch {
      setError('username หรือ password ไม่ถูกต้อง')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-xl w-80 space-y-4">
        <h1 className="text-white text-xl font-bold">Personal Dashboard</h1>
        <input
          className="w-full bg-gray-800 text-white px-3 py-2 rounded"
          placeholder="username"
          value={form.username}
          onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
        />
        <input
          className="w-full bg-gray-800 text-white px-3 py-2 rounded"
          placeholder="password"
          type="password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded"
          onClick={submit}
        >
          Login
        </button>
      </div>
    </div>
  )
}
