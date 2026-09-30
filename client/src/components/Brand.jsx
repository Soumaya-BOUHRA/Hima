import { useTheme } from '../context/ThemeContext.jsx';

/**
 * HIMA brand — always uses the real logo assets, never CSS recreations.
 * /brand/hima-logo.svg (light) · /brand/hima-logo-dark.svg (dark) ·
 * /brand/hima-icon.svg (symbol only) · /brand/hima-app-icon.svg
 */
export function BrandSymbol({ size = 30, className = '', style }) {
  return (
    <img
      src="/brand/hima-icon.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
      style={style}
      draggable={false}
    />
  );
}

export default function Brand({
  href,
  height = 40,
  variant = 'auto',
  className = '',
}) {
  const { theme } = useTheme();
  const dark = variant === 'dark' || (variant === 'auto' && theme === 'dark');
  const src = dark ? '/brand/hima-logo-dark.svg' : '/brand/hima-logo.svg';

  const img = (
    <img
      src={src}
      alt="HIMA — هِمّة"
      height={height}
      className={className}
      draggable={false}
    />
  );

  if (href) {
    return (
      <a className="sidebar-brand" href={href} aria-label="HIMA — accueil">
        {img}
      </a>
    );
  }

  return img;
}
