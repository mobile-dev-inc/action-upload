# mobile.dev Upload Action

Upload your app to mobile.dev for analysis.

# Example

```yaml
- uses: mobile-dev-inc/action-upload@v0.0.1
  with:
    api-key: ${{ secrets.MOBILE_DEV_API_KEY }}
    name: ${{ github.sha }}
    app-file: app/build/outputs/apk/debug/app-debug.apk
```

# Android Deobfuscation

Include the Proguard mapping file to deobfuscate Android performance traces:

```yaml
- uses: mobile-dev-inc/action-upload@v0.0.1
  with:
    api-key: ${{ secrets.MOBILE_DEV_API_KEY }}
    name: ${{ github.sha }}
    app-file: app/build/outputs/apk/release/app-release.apk
    mapping-file: app/build/outputs/mapping/release/mapping.txt
```
