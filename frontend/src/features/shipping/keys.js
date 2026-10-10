// src/features/shipping/keys.js
export const shippingKeys = {
  all: ['shipping'],
  wilayas: () => ['shipping', 'wilayas'],
  communes: (wilayaCode) => ['shipping', 'communes', wilayaCode],
}