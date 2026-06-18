# SF Pro fonts (optional)

Jarvis uses Apple's **SF Pro** typeface. SF Pro is Apple-licensed and is **not**
bundled with this repo.

- On Apple devices, the system font stack already resolves to SF Pro — nothing
  to do.
- Elsewhere, you can self-host SF Pro to match. Download it from
  <https://developer.apple.com/fonts/> and drop these `.woff2` files here:

  - `SF-Pro-Display-Regular.woff2`
  - `SF-Pro-Display-Medium.woff2`
  - `SF-Pro-Display-Semibold.woff2`
  - `SF-Pro-Display-Bold.woff2`

If the files are absent, the app falls back to the system UI font stack
gracefully. No build step depends on them.
