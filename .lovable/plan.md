Replace the placeholder fingerprint in `public/.well-known/assetlinks.json` with the real SHA-256 from Play Console.

## Change

`public/.well-known/assetlinks.json` → set `sha256_cert_fingerprints` to:
```
C9:E2:C0:25:F8:D6:B9:4C:DE:0E:6F:6F:C1:26:34:BA:B8:AE:C9:49:54:19:A3:DC:82:8D:86:CD:7F:16:94:A2
```

Final file:
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.faydabook.twa",
      "sha256_cert_fingerprints": [
        "C9:E2:C0:25:F8:D6:B9:4C:DE:0E:6F:6F:C1:26:34:BA:B8:AE:C9:49:54:19:A3:DC:82:8D:86:CD:7F:16:94:A2"
      ]
    }
  }
]
```

## After publish

1. Verify the file is live: `https://faydabook.com/.well-known/assetlinks.json` (must return JSON, `Content-Type: application/json`, no redirect).
2. Validate with Google: `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://faydabook.com&relation=delegate_permission/common.handle_all_urls`
3. On device: uninstall the app, then reinstall from Play Store so Chrome re-runs Digital Asset Links verification. The URL bar should disappear.

If it still shows the browser chrome after reinstall, the package name on Play Store doesn't match `com.faydabook.twa` — share the Play Store listing URL so I can confirm.
