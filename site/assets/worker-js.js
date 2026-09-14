// Runs a lesson's JavaScript program away from the page, and sends back what it prints.
self.onmessage = (event) => {
  const send = (type, text) => self.postMessage({ type, text });
  const show = (v) => (typeof v === 'string' ? v : JSON.stringify(v));
  self.console = {
    log: (...parts) => send('out', parts.map(show).join(' ') + '\n'),
    error: (...parts) => send('out', parts.map(show).join(' ') + '\n'),
    warn: (...parts) => send('out', parts.map(show).join(' ') + '\n'),
  };
  try {
    new Function(event.data.source)();
    send('done');
  } catch (err) {
    send('error', String(err && err.stack ? err.stack : err));
  }
};
