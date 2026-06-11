type BrandLogoProps = {
  small?: boolean
}

export default function BrandLogo({ small }: BrandLogoProps) {
  const iconSize = small ? 28 : 34
  const fontSize = small ? '0.9375rem' : '1.0625rem'
  const fontWeight = small ? 700 : 800

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
      <img
        src="/brand/logo-icon.svg"
        alt=""
        width={iconSize}
        height={iconSize}
        style={{ display: 'block', borderRadius: small ? 7 : 9, flexShrink: 0 }}
        aria-hidden="true"
      />
      <span
        style={{
          fontSize,
          fontWeight,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        <span style={{ color: 'var(--dp-ink)' }}>Sell</span>
        <span style={{ color: 'var(--dp-primary)' }}>io</span>
      </span>
    </div>
  )
}
