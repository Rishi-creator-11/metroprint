# MetroPrint USA

Professional custom printing and marketing services website built with Next.js, Supabase, and Resend.

## Features

- **Product catalog** — Browse 23+ products across 5 categories with images and configurable options
- **Quote request workflow** — Customers select specs, upload artwork, and submit quote requests
- **File uploads** — Multiple artwork files stored in Supabase Storage (PDF, PNG, JPG, AI, PSD, EPS, SVG)
- **Email notifications** — MetroPrint receives email alerts via Resend; customers get confirmation emails
- **Admin dashboard** — View, filter, and manage quote requests with status updates and internal notes
- **Mobile responsive** — Clean, professional design that works on all screen sizes

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Supabase (Database, Storage, Auth)
- Resend (Email)
- Vercel (Deployment)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial.sql` via the SQL Editor
3. Run the seed file in `supabase/seed.sql` to populate products
4. Create an admin user in **Authentication → Users → Add User**

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the site and [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin dashboard.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, categories, popular products, how it works |
| `/products` | Full product catalog with category filters |
| `/products/[slug]` | Individual product page with quote form |
| `/request-quote` | General quote request page |
| `/contact` | Contact information |
| `/admin/login` | Admin authentication |
| `/admin/dashboard` | Manage quote requests |
| `/admin/dashboard/[id]` | View and update individual requests |

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.example`
4. Deploy

## Adding New Products

Products use a JSON `options_schema` for dynamic form fields. Add a row to the `products` table or extend `src/lib/products-data.ts` for local fallback:

```json
{
  "fields": [
    {
      "name": "quantity",
      "label": "Quantity",
      "type": "select",
      "options": ["50", "100", "250"],
      "required": true
    }
  ]
}
```

Supported field types: `select`, `radio`, `text`, `textarea`

## License

Private — MetroPrint USA
