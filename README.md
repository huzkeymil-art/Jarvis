# Skell — Gorilla Tag Creator

A one-page site for **Skell** ([@Skellgt](https://www.youtube.com/@Skellgt)), the Gorilla Tag creator who goes live every day.

## What's on the page

| Section | What it does |
| --- | --- |
| Preloader | "Joining lobby" counter that wipes away into the hero |
| Hero | A live, low-poly Gorilla Tag-style forest (Three.js) at dusk, with a lava monke hopping through the trees. The giant **SKELL** letters stretch toward your cursor (variable-font width axis) |
| Marquee | Tilted lava band that speeds up and flips direction with your scroll |
| Who's Skell | Paragraph that lights up word by word as you read |
| The troop | Animated subscriber counter and a milestone "branch" showing progress to the next goal |
| On the channel | Horizontal-scrolling cards (stacked on phones) |
| Creator code | A copy-to-clipboard card styled like the in-game computer terminal, with confetti |
| Find Skell | YouTube, Discord, Meta and business email, with one-click copy for usernames |

It respects `prefers-reduced-motion`: animations, smooth scrolling and the 3D flythrough switch off, and every piece of content stays visible.

## Updating the numbers

Subscriber count and milestones live in [`src/js/config.js`](src/js/config.js):

```js
export const SKELL = {
  subscribers: 14000,
  milestones: [1000, 5000, 10000, 15000, 20000],
};
```

Change `subscribers` and the counter, the "Climbing to …" headline, the "… to go" number and the milestone branch all update. Once he passes the last milestone, add bigger ones to the list.

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
- [Three.js](https://threejs.org) for the forest (loaded in its own chunk, after the page)
- [GSAP](https://gsap.com) + ScrollTrigger for animation
- [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- Self-hosted variable fonts: Archivo (weight + width axes) and JetBrains Mono

---

Gorilla Tag is a trademark of Another Axiom. This site is not affiliated with Another Axiom.
