# Meteor 3.4 Cordova / android-device issue (draft for GitHub)

**Title:** [Cordova] Meteor 3.4: WebSocket "Invalid frame header", Svelte 5 crash "batch.current.keys is not a function or not iterable"

---

## Environment

- **Meteor:** 3.4
- **Platform:** Cordova (Android). Run: `meteor run android-device --mobile-server=http://192.168.1.102:3000`
- **Frontend:** Svelte 5 (runes: `$state`), svelte@^5.38.2
- **package.json:** `"meteor": { "modern": true }`

## Important: issue affects desktop browser too

The problem is **not only in the Cordova WebView** but also in the **desktop browser** when Meteor is started with `meteor run android-device`. If you open the same app URL (e.g. `http://192.168.1.102:3000`) in a desktop browser, the same errors occur:

1. **WebSocket:** `WebSocket connection to 'ws://192.168.1.102:3000/sockjs/.../websocket' failed: Invalid frame header`
2. **Svelte 5:** `Uncaught TypeError: batch.current.keys is not a function or its return value is not iterable` in `flush_effects` / `Batch.flush`

So when running with `meteor run android-device`, **all clients** connecting to that server (both the device and the desktop) are affected, not just Cordova.

---

## 1. WebSocket / SockJS errors

In the app (Cordova WebView or desktop browser when server is run with android-device), the DDP/HMR connection fails with:

```
WebSocket connection to 'ws://192.168.1.102:3000/sockjs/601/xlai1zou/websocket' failed: Invalid frame header
WebSocket connection to 'ws://192.168.1.102:3000/sockjs/680/1tsulvhx/websocket' failed: Invalid frame header
...
POST http://192.168.1.102:3000/sockjs/680/dl3gasom/xhr?t=... net::ERR_CONNECTION_TIMED_OUT
```

- HMR reports: `HMR: Unable to do HMR. Falling back to hot code push.`
- The same server works in a normal desktop browser when started with plain `meteor run`; the issue appears when the server is started with `meteor run android-device` and the client (desktop or device) connects to that URL.

Possible causes to consider: WebView or proxy altering WebSocket frames; CSP or Cordova restrictions on `ws://`; or different SockJS/WebSocket handling in the android-device run mode.

---

## 2. Svelte 5 runtime crash (Map/iterator)

After the WebSocket errors, the app crashes in the bundled Svelte 5 runtime:

```
Uncaught TypeError: batch.current.keys is not a function or its return value is not iterable
    at flush_effects (app.js?hash=...:11570:40)
    at Batch.flush (app.js?hash=...:11281:4)
```

- Svelte 5 uses an internal `Batch` (a `Map`-like structure) and in `flush_effects` iterates over `batch.current.keys()`.
- `Map.prototype.keys()` returns an iterator. The error indicates that either `batch.current` is not a proper `Map`, or `.keys` is not a function, or its return value is not iterable in this environment.

Because the same crash happens in a **desktop browser** when connecting to the android-device server, the cause is likely not “old WebView lacks Map” but rather that in **android-device run mode** a different client bundle (e.g. Cordova/mobile) is served to all clients, with different polyfill or runtime behavior (e.g. `ecmascript-runtime-client` not loaded or different build), so Svelte 5’s `Batch`/`flush_effects` fails for every client.

---

## Expected behavior

- When running `meteor run android-device`, both the Cordova app and a desktop browser opening the same URL should be able to connect via WebSocket (or SockJS fallback) without “Invalid frame header”.
- The client bundle served in this mode should provide a working `Map` and iterator protocol so that Svelte 5’s `Batch`/`flush_effects` runs without “batch.current.keys is not a function or its return value is not iterable”.

---

## Possible directions (for discussion)

1. **WebSocket:** Investigate why in android-device run mode WebSocket (or SockJS) fails for all clients; document or fix Cordova/network requirements (CSP, proxy, transport fallback).
2. **Polyfills / bundle:** For the client served when the server is started with android-device, ensure the same polyfills (e.g. `ecmascript-runtime-client` / Map and iterator support) as in the normal web client, or document that Cordova/mobile bundle must not be served to desktop browsers when they connect to the same URL.
3. **Svelte 5:** If the Cordova/mobile bundle is intentionally different, document that apps using Svelte 5 (or any code relying on `Map`/iterators) must ensure polyfills are loaded for that bundle.

---

## Reproduction

1. Create a Meteor 3.4 app with `"modern": true` and Svelte 5 (e.g. runes like `$state`).
2. Add Android platform and run:  
   `meteor run android-device --mobile-server=http://<LAN_IP>:3000`
3. Open **either**:
   - the Cordova app on the device, or  
   - the same URL (e.g. `http://<LAN_IP>:3000`) in a **desktop browser**.
4. Observe WebSocket “Invalid frame header” and then the `batch.current.keys` crash in both cases.
