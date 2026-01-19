import { api } from './api'

export async function registerUser({ name, email, password }) {
  const normalized = email.trim().toLowerCase()

  const { data: existing } = await api.get(`/users?email=${encodeURIComponent(normalized)}`)
  if (existing?.length) throw new Error('Este email já existe.')

  const role = normalized.includes('admin') ? 'admin' : 'user'

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalized,
    password, // mock (ok para projeto académico)
    role,
    avatarUrl: '',
    createdAt: new Date().toISOString()
  }

  const { data } = await api.post('/users', user)
  return data
}

export async function loginUser({ email, password }) {
  const normalized = email.trim().toLowerCase()

  const { data } = await api.get(
    `/users?email=${encodeURIComponent(normalized)}&password=${encodeURIComponent(password)}`
  )

  if (!data?.length) throw new Error('Credenciais inválidas.')
  return data[0]
}
