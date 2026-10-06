# Skell | Gorilla Tag creator

A one-page site for **Skell** ([@Skellgt](https://www.youtube.com/@Skellgt)), the Gorilla Tag creator who goes live every day.

## What's on the page

| Section | What it does |
| --- | --- |
| Hero | Full-bleed key art of the Skell mascot, the name, one line about the channel, and two buttons (watch, creator code). Phones get their own vertical crop. |
| About | Stream setup photo next to a short intro and quick facts. |
| On the channel | Image grid: collabs, tag and infection, and a "new stream every day" card. |
| The troop | Subscriber count, the next milestone and a row of milestone chips. |
| Creator code | Copy-to-clipboard code chip next to a Shiny Rocks image. |
| Find Skell | YouTube, Discord and Meta (one-click copy for usernames) and the business email. |

It respects `prefers-reduced-motion` (no smooth scroll or animation), and anything that fades in stays reachable by keyboard.

## Updating the numbers

Subscriber count and milestones live in [`src/js/config.js`](src/js/config.js):

```js
export const SKELL = {
  subscribers: 14000,
  milestones: [1000, 5000, 10000, 15000, 20000],
};
```

Change `subscribers` and the counter, the "Next stop" goal, the "to go" number and the milestone chips all update. Once he passes the last milestone, add bigger ones to the list.

## Images

All artwork in `public/img/` was generated with Higgsfield (Seedream 5.0). The mascot (a legless low-poly gorilla with a skull painted on its face) is an original character made for this site, not Skell's actual in-game avatar.

Every image comes in a few widths, as AVIF plus a JPEG fallback, named `<name>-<width>.<ext>`:

| Name | Used for | Widths |
| --- | --- | --- |
| `hero` | Hero, desktop | 1200, 1800, 2400 |
| `hero-m` | Hero, phones | 720, 1080 |
| `desk` | About | 800, 1200, 1500 |
| `collab` | Collabs tile | 1000, 1500, 2000 |
| `chase` | Tag and infection tile | 800, 1200, 1500 |
| `gems` | Creator code | 700, 1000, 1400 |

To swap one (for example, for a real stream screenshot or Skell's actual avatar), replace the files with the same names and sizes. `og.jpg` is the link-preview image, and `favicon.png` / `apple-touch-icon.png` are cropped from the mascot's face.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
npm run preview  # serve the production build
```

## Deploy

`vercel.json` is set up for Vite, so importing the repo into Vercel works with no extra settings. Any static host (Netlify, GitHub Pages, Cloudflare Pages) works too: build, then upload `dist/`.

## Stack

- [Vite](https://vite.dev) for the build
- [GSAP](https://gsap.com) + ScrollTrigger for the small amount of motion, [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque), self-hosted through Fontsource
- Brand icons from [Simple Icons](https://simpleicons.org), UI icons from [Phosphor](https://phosphoricons.com), inlined as an SVG sprite

---

Gorilla Tag is a trademark of Another Axiom. This site is not affiliated with Another Axiom.
