const listeners = {};

export default {
  on(event, fn) {
    (listeners[event] ||= []).push(fn);
  },
  off(event, fn) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(f => f !== fn);
  },
  emit(event, data) {
    (listeners[event] || []).forEach(fn => fn(data));
  },
  clear() {
    for (const key in listeners) delete listeners[key];
  },
};
