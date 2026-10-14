// src/features/serviceRequests/keys.js
export const serviceRequestKeys = {
  all: ['service-requests'],

  adminList:   (filters = {}) => ['service-requests', 'admin', 'list', filters],
  adminDetail: (id)           => ['service-requests', 'admin', 'detail', id],
}