// Runs a lesson's Python program with Pyodide (Python compiled for the browser).
// Loaded as a module worker; Pyodide is downloaded only when a reader presses Run on a Python program.
// (A classic worker with importScripts(pyodide.js) fails to load in Chromium-based browsers, so we import pyodide.mjs.)
const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/';
let ready = null;

self.onmessage = async (event) => {
  const send = (type, text) => self.postMessage({ type, text });
  try {
    if (!ready) {
      send('status', event.data.loading);
      ready = import(`${PYODIDE}pyodide.mjs`).then(({ loadPyodide }) => loadPyodide({ indexURL: PYODIDE }));
    }
    let py;
    try {
      py = await ready;
    } catch (err) {
      ready = null; // let the reader try again, for example after reconnecting
      throw err;
    }
    send('ready');
    py.setStdout({ batched: (line) => send('out', line + '\n') });
    py.setStderr({ batched: (line) => send('out', line + '\n') });
    const scope = py.globals.get('dict')();
    scope.set('__name__', '__main__');
    try {
      await py.runPythonAsync(event.data.source, { globals: scope });
    } finally {
      scope.destroy();
    }
    send('done');
  } catch (err) {
    send('error', String(err && err.message ? err.message : err));
  }
};
