// src/constants/serviceRequests.js

export const SERVICE_REQUEST_STATUSES = ['pending', 'completed', 'cancelled']

export const SERVICE_REQUEST_STATUS_LABELS = {
  pending:   'En attente',
  completed: 'Terminée',
  cancelled: 'Annulée',
}

export const SERVICE_REQUEST_STATUS_TONES = {
  pending:   'warning',
  completed: 'success',
  cancelled: 'neutral',
}