# Creator Tally — Product Specification

## Overview

A financial clarity tool for content creators who make money online. Track sponsorships, platform payouts, affiliate income, and more — then instantly see what you can safely spend vs. what to save for taxes.

## Why "Creator Tally"?

The name evokes:
- **Tallying** — counting, tracking, accounting
- **Tally marks** — the universal symbol for counting (5 = four vertical lines with a diagonal strike-through)
- **Creator-specific** — built for the creator economy

## Live URLs (To Be Configured)

- **Production**: https://creatortally.app
- **GitHub**: https://github.com/YOUR_USERNAME/creatortally

---

## Feature Status

### ✅ Phase 1: Shippable MVP (Complete)
- [x] Landing page with hero + pricing
- [x] Income tracking with categories
- [x] Tax/savings rules (adjustable %)
- [x] 4 Numbers dashboard (Total, Tax, Reinvest, Take-Home)
- [x] Usage limits (20 entries free tier)
- [x] Month navigation
- [x] Meta tags + SEO
- [x] Privacy Policy page
- [x] README.md documentation
- [x] Cookie consent banner

### ✅ Phase 2: Polish (Complete)
- [x] Custom SVG logo (tally marks icon)
- [x] Toast notifications (success/error/info with SVG icons)
- [x] Month-over-month comparison stats with animations
- [x] Terms of Service page
- [x] Cookie Policy page
- [x] 404 error page
- [x] Keyboard shortcuts hint
- [x] First-time user tour/tooltip
- [x] Better empty states with tips
- [x] CSV export functionality

### ✅ Phase 3: Infrastructure (Complete - Code Ready)
- [x] Supabase integration code
- [x] Stripe integration code
- [x] Netlify function for Stripe checkout
- [x] Environment variable template

### ✅ Phase 4: Advanced Analytics (Complete)
- [x] Visual Trend Analytics (Income Trend Line Chart)
- [x] Revenue Mix Analytics (Category Doughnut Chart)

### 📋 Future Features
- [ ] Real Supabase connection
- [ ] Real Stripe checkout
- [ ] Bank connection (Plaid)
- [ ] Email notifications (Resend)
- [ ] Analytics (Plausible/PostHog)
- [ ] PDF export
- [ ] Dark/light mode toggle
- [ ] Mobile app (React Native)
- [ ] Quarterly tax reminder emails
- [ ] Multi-currency support

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Vanilla HTML/CSS/JS |
| Styling | Custom CSS with variables |
| Database | LocalStorage (MVP) → Supabase (Prod) |
| Payments | Stripe (placeholder ready) |
| Auth | Supabase Auth (planned) |
| Hosting | Netlify |
| Domain | Namecheap/Cloudflare |

---

## Architecture

```
creatortally/
├── index.html          # Main app (landing + dashboard)
├── privacy.html        # Privacy Policy
├── terms.html          # Terms of Service
├── cookies.html        # Cookie Policy
├── 404.html            # Error page
├── SPEC.md             # This file
├── README.md           # Setup guide
├── CONTRIBUTING.md     # Contribution guidelines
├── .env.example        # Environment variables template
├── deploy.sh           # One-command deploy
├── netlify/
│   └── functions/
│       └── create-checkout.js
└── .gitignore
```

---

## Design Language

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Background | #0F0F0F | Page background |
| Card | #1A1A1A | Card surfaces |
| Card Elevated | #242424 | Input backgrounds |
| Income Blue | #3B82F6 | Total income |
| Tax Purple | #A855F7 | Tax reserve |
| Reinvest Orange | #F97316 | Business reinvest |
| Savings Yellow | #EAB308 | Savings buffer |
| Take-Home Green | #22C55E | Safe to spend |

### Typography
- **Headings**: Inter 700
- **Body**: Inter 400/500
- **Numbers**: JetBrains Mono 500/600

### Logo
- Tally marks icon (the universal "5" counting symbol)
- Green gradient background
- Simple, memorable, unique

---

## User Flow

1. **Landing Page** → Email signup → Dashboard
2. **Dashboard (Free)** → Limited to 20 entries/month
3. **Upgrade Prompt** → When limit hit → Stripe checkout
4. **Dashboard (Pro)** → Unlimited entries + premium features

---

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| Free | $0/mo | 20 entries/month, 1 month history |
| Pro | $9/mo | Unlimited entries, Advanced Financial Analytics (Trends & Source Mix), bank connection, export, tax reminders |

---

## API Reference

### Supabase Schema

```sql
-- Users (extends auth.users)
ALTER TABLE auth.users ADD COLUMN tier TEXT DEFAULT 'free';
ALTER TABLE auth.users ADD COLUMN rules JSONB DEFAULT '{"tax":25,"reinvest":10,"savings":20}';

-- Entries
CREATE TABLE entries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2),
  category TEXT,
  source TEXT,
  month_key TEXT,
  created_at TIMESTAMPTZ
);
```

### Environment Variables

```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx
STRIPE_PUBLISHABLE_KEY=pk_xxx
STRIPE_PRICE_ID=price_xxx
```

---

## Deployment

```bash
# One-command deploy
./deploy.sh

# Manual deploy
git push to GitHub → Netlify imports automatically
```

---

## Changelog

### v1.0.0 (Initial Launch)
- Landing page with pricing
- Income tracking dashboard
- 4 financial numbers display
- Tax/savings rules
- Usage limits
- Cookie consent
- SEO meta tags
- Legal pages (Privacy, Terms, Cookies)
- Documentation (README, CONTRIBUTING)
- Unique "Creator Tally" branding with tally mark logo
- Supabase + Stripe integration code ready