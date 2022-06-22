# mobile.dev Upload Action

Upload your app to mobile.dev for analysis.

# Triggers

Trigger this action on (1) pushes to your main branch and (2) pull requests opened against your main branch:


```yaml
on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]
```

# Android

```yaml
- uses: mobile-dev-inc/action-upload@v1.0.0
  with:
    api-key: ${{ secrets.MOBILE_DEV_API_KEY }}
    name: ${{ github.sha }}
    app-file: app/build/outputs/apk/debug/app-debug.apk
```

`app-file` should point to an x86 compatible APK file

### Proguard Deobfuscation

Include the Proguard mapping file to deobfuscate Android performance traces:

```yaml
- uses: mobile-dev-inc/action-upload@v1.0.0
  with:
    api-key: ${{ secrets.MOBILE_DEV_API_KEY }}
    name: ${{ github.sha }}
    app-file: app/build/outputs/apk/release/app-release.apk
    mapping-file: app/build/outputs/mapping/release/mapping.txt
```

# iOS

```yaml
- uses: mobile-dev-inc/action-upload@v1.0.0
  with:
    api-key: ${{ secrets.MOBILE_DEV_API_KEY }}
    name: ${{ github.sha }}
    app-file: app.zip
```

`app-file` should point to an x86 compatible Simulator build packaged in a `zip` archive
