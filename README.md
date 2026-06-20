# Creator Tally

**Financial clarity for content creators who make money online.**

Track sponsorships, platform payouts, affiliate income, and more — then instantly see what you can safely spend vs. what to save for taxes.

## ✨ Features

- 📊 **4 Numbers, Instant Clarity** — Total income, tax reserve, reinvest budget, and take-home pay
- 🤝 **All Income Sources** — Sponsorships, YouTube, Patreon, affiliate, courses, and more
- 🧮 **No Accounting Jargon** — Built for creators, not accountants
- 📈 **Month-over-Month Comparison** — See how your income is trending
- 💾 **Local or Cloud Storage** — LocalStorage by default, Supabase when ready
- 📱 **Responsive** — Works on desktop and mobile
- 🚀 **Stripe Ready** — Payment integration for Pro tier
- 📜 **Legal Pages** — Privacy, Terms, Cookies fully written

## 🚀 Quick Start

### Option 1: Open Directly
```bash
# Just open index.html in your browser
open index.html
```

### Option 2: Local Server (Recommended)
```bash
npx serve .
# Visit http://localhost:3000
```

### Option 3: One-Command Deploy
```bash
./deploy.sh
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Vanilla HTML, CSS, JavaScript |
| **Styling** | Custom CSS with variables |
| **Database** | LocalStorage (MVP) → Supabase (Production) |
| **Payments** | Stripe (ready for integration) |
| **Auth** | Supabase Auth |
| **Hosting** | Netlify (free tier) |
| **Functions** | Netlify Functions (serverless) |
| **Fonts** | Inter + JetBrains Mono (Google Fonts) |

## 📁 Project Structure

```
creatortally/
├── index.html              # Main app (landing + dashboard)
├── privacy.html            # Privacy Policy
├── terms.html              # Terms of Service
├── cookies.html            # Cookie Policy
├── 404.html                # Custom 404 page
├── favicon.svg             # App icon (tally marks!)
├── og-image.svg            # Social preview
├── SPEC.md                 # Product specification
├── README.md               # This file
├── CONTRIBUTING.md         # Contribution guidelines
├── .env.example            # Environment variables template
├── deploy.sh               # One-command deploy
├── netlify/
│   └── functions/
│       └── create-checkout.js  # Stripe checkout function
└── .gitignore
```

## 🔧 Setup

### 1. Clone & Open
```bash
git clone https://github.com/YOUR_USERNAME/creatortally.git
cd creatortally
open index.html
```

### 2. Environment Variables
```bash
cp .env.example .env
# Edit .env with your keys
```

### 3. Supabase Setup
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run in SQL Editor:

```sql
-- Income entries table
CREATE TABLE entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  source TEXT,
  month_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Users manage own entries
CREATE POLICY "Users manage own entries" 
ON entries FOR ALL 
USING (auth.uid() = user_id);
```

4. Copy Project URL + anon key to `.env`

### 4. Stripe Setup
1. Create account at [stripe.com](https://stripe.com)
2. Create product: Dashboard → Products → Add Product
   - Name: "Creator Tally Pro"
   - Price: $9/month (recurring)
3. Copy API keys to `.env`

### 5. Deploy
```bash
./deploy.sh
```

## 🎯 Roadmap

| Status | Feature |
|--------|---------|
| ✅ | Landing page + pricing |
| ✅ | Income tracking dashboard |
| ✅ | Tax/savings rules |
| ✅ | Usage limits (20 entries free) |
| ✅ | Month navigation |
| ✅ | Month comparison stats |
| ✅ | Toast notifications |
| ✅ | Cookie consent |
| ✅ | Legal pages (Privacy, Terms, Cookies) |
| ✅ | SEO meta tags |
| ✅ | CSV export |
| ✅ | Keyboard shortcuts |
| ✅ | First-time tour |
| ✅ | Stripe integration code |
| ✅ | Supabase integration code |
| 🚧 | Real Stripe checkout |
| 🚧 | Real Supabase connection |
| 📋 | Bank connection (Plaid) |
| 📋 | PDF export |
| 📋 | Email notifications |
| 📋 | Dark/light mode |

## 💰 Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0/mo | 20 entries/month, 1 month history |
| **Pro** | $9/mo | Unlimited entries, Advanced Financial Analytics (Trends & Source Mix), bank connection, export, tax reminders |

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

## 📧 Support

For questions or issues, [open a GitHub issue](https://github.com/YOUR_USERNAME/creatortally/issues).

---

**Built with ❤️ for creators who want to understand their finances.**