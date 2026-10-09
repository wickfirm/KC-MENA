-- Sync the CMS-managed Local Business copy to the client-delivered reference.
-- Safe to re-run. It changes only the specified content fields for this page.
UPDATE pages
SET content = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(content, '{panels,0,body}', to_jsonb($copy$Sourcing land, refining the product, and structuring capital early — so margins are protected before the market starts pricing the project. Meydan Horizon is the first branded residential development, with 452,389 sq ft of built-up area and 203,575 sq ft of gross sellable area.$copy$::text), true),
      '{panels,1,body}', to_jsonb($copy$A Dubai portfolio spanning Downtown, Dubai Hills, Hartland, and Palm Jumeirah across 60 units, built on disciplined underwriting, active asset management, and selective market access.$copy$::text), true),
    '{panels,2,body}', to_jsonb($copy$Led by chef Keigo Abe, Kasumigaseki Restaurant brings Neo-Japanese cuisine, charcoal fire, and wabi-sabi design to Vida Emirates Hills — built for intimate dinners and destination-led dining.$copy$::text), true),
  '{intro,footnote}', '{"label":"As of February 28, 2026","href":"https://kasumigaseki.co.jp/en/ir/"}'::jsonb, true),
  updated_at = now()
WHERE slug = 'local-business';
