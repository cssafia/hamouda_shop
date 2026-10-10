import { useSyncExternalStore } from 'react';

let state = { open: false, justAddedId: null };
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const getSnapshot = () => state;

export const cartUI = {
  open(justAddedId = null) {
    state = { open: true, justAddedId };
    emit();
  },
  close() {
    state = { open: false, justAddedId: null };
    emit();
  },
  clearJustAdded() {
    state = { ...state, justAddedId: null };
    emit();
  },
};

export function useCartUI() {
  return useSyncExternalStore(subscribe, getSnapshot);
}