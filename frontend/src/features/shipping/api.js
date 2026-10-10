// src/features/shipping/api.js
import { apiClient } from '../../services/apiClient'

export async function listWilayas() {
  const { data } = await apiClient.get('/shipping/wilayas')
  return data.data
  // [{ code, name, home_rate, stop_desk_rate }]
}

export async function listCommunes(wilayaCode) {
  const { data } = await apiClient.get('/shipping/communes', {
    params: { wilaya: wilayaCode },
  })
  return data.data
  // { wilaya: { code, name, home_rate, stop_desk_rate }, communes: [...] }
}