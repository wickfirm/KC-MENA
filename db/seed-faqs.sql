-- Starter FAQ content (contract scope: FAQ page build + copywriting)
-- Apply via Supabase SQL Editor. Safe to re-run (skips if seeded).
INSERT INTO faqs (question, answer, category, sort_order)
SELECT * FROM (VALUES
  ('What is Kasumigaseki MENA?',
   'Kasumigaseki MENA (KME Investment & Management L.L.C) is the regional subsidiary of Kasumigaseki Capital Co., Ltd., headquartered in Tokyo. From our Dubai base we develop, invest in, and operate businesses across the GCC and beyond — spanning real estate development, investment & asset management, food & beverage, and global business ventures.',
   'Company', 1),
  ('Where are you located?',
   'Our head office is at Dubai Hills Estate, Business Park 4, Office 304-305, Dubai, UAE. We also operate a Sales Centre in Business Bay and hospitality locations across Dubai, with a presence in the United States.',
   'Company', 2),
  ('What is your relationship with Kasumigaseki Capital?',
   'Kasumigaseki MENA is the Middle East platform of Kasumigaseki Capital Co., Ltd. (TSE listed). We combine the group''s discipline, capital strength, and operating expertise with deep regional knowledge to turn challenge into value.',
   'Company', 3),
  ('Which sectors do you invest in?',
   'Our local business covers real estate development, real estate investment & asset management, and food & beverage. Through our global business network we are also active in logistics, hotel operations, and healthcare.',
   'Business', 1),
  ('Do you partner with external investors and developers?',
   'Yes. We work with landowners, developers, institutional partners, and family offices on structured development and investment opportunities across the GCC. Each partnership is evaluated on alignment, feasibility, and long-term value creation.',
   'Business', 2),
  ('Can I visit your projects or restaurant locations?',
   'Absolutely. Contact us to arrange a visit to our sales centre, project sites, or the Kasumigaseki restaurant at Vida Emirates Hills. Use the Contact Us link or email info.dubai@kasumigaseki.co.jp.',
   'Working With Us', 1),
  ('How do I apply for a job at Kasumigaseki MENA?',
   'Open positions are listed on our Careers page. Apply directly through a listing, or send your CV to info.dubai@kasumigaseki.co.jp with the role in the subject line — we review every application.',
   'Working With Us', 2),
  ('How can I get the latest company news?',
   'Follow our News page for announcements and project updates, or connect with Kasumigaseki MENA on LinkedIn. Investor-level updates from our parent are available on the Kasumigaseki Capital IR page.',
   'Working With Us', 3)
) AS v(question, answer, category, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM faqs);
