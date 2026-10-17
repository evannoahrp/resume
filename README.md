# Absolutely Nothing Interesting Here

You found the README. Congratulations: your scrolling skills are now production-ready.

This is, allegedly, a pixel-art resume for **Evannoah Rolimarch Pratama**. If you came looking for the resume, try the actual page instead of reading the instructions. If you came looking for instructions, unfortunately, you are in the right place.

## The extremely complicated setup

1. Install the dependencies:

   ```bash
   npm ci
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open the local URL Vite prints in your terminal. No, the browser will not open itself. It has boundaries.

## Production build

```bash
npm run build
```

This creates the production site in `dist/`. It does not build character. For a local production preview, run:

```bash
npm run preview
```

## Deploying

The GitHub Actions workflow in `.github/workflows/deploy.yml` builds and deploys the site to GitHub Pages when changes are pushed to `main`. Set the repository's Pages source to **GitHub Actions**. The computer will do the rest, which is more than this README can promise.

## Easter eggs

There are several hidden around the site. This README is not going to spoil them. It has already given you enough attention.

---

*If you read all the way down here, please accept this imaginary achievement badge: **README completionist**.*
