import { CLIENT_INLINE_OVERRIDES, CLIENT_PAGE_CSS, CLIENT_SITE_CSS, type ClientPage } from "@/lib/client-css";

/**
 * The client-delivered CSS for one page, verbatim and in the delivered order: the page's own
 * inline <style> first, then the shared site.css (which wins ties, exactly as in the reference).
 * Rendered inside the page tree so it is swapped, not accumulated, on client-side navigation.
 */
export default function ClientPageCss({ page }: { page: ClientPage }) {
  return (
    <>
      <style data-client-css={page} dangerouslySetInnerHTML={{ __html: CLIENT_PAGE_CSS[page] }} />
      <style data-client-css="site" dangerouslySetInnerHTML={{ __html: CLIENT_SITE_CSS }} />
      {CLIENT_INLINE_OVERRIDES[page] && (
        <style data-client-css="inline" dangerouslySetInnerHTML={{ __html: CLIENT_INLINE_OVERRIDES[page] }} />
      )}
    </>
  );
}
