import { api } from './api'

export async function deleteXpEventsBySource(sourceType, sourceId) {
    
  const { data } = await api.get(`/xpEvents?sourceType=${sourceType}&sourceId=${sourceId}`)
  await Promise.all((data || []).map(ev => api.delete(`/xpEvents/${ev.id}`)))
  return data?.length || 0
}
