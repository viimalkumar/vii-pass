import { useState } from 'react';
import type { ReactElement } from 'react';

/**
 * Home-header brand image: mobile uses the single-symbol mark, while non-mobile
 * uses the full wordmark. If imagery is unavailable, a visible text fallback is
 * rendered so branding remains present.
 */
export function BrandLogo(): ReactElement {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const className = 'brand-logo brand-logo--header';

  if (imageUnavailable) {
    return <span className={`${className} brand-logo--fallback`}>Vii Pass</span>;
  }

  return (
    <picture className={className}>
      <source media="(max-width: 575.98px)" srcSet="/logo/logo.png" />
      <img
        className="brand-logo__image"
        src="/logo/full_logo.png"
        alt="Vii Pass"
        width={1468}
        height={372}
        onError={() => setImageUnavailable(true)}
      />
    </picture>
  );
}