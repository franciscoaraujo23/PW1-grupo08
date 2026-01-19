import { api } from './api'

export async function patchUser(userId, patch) {
  const { data } = await api.patch(`/users/${userId}`, patch)
  return data
}
