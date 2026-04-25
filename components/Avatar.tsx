interface AvatarProps {
  name: string
  color: string
  size?: number
  showRing?: boolean
}

export function Avatar({ name, color, size = 36, showRing = false }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const fontSize = Math.round(size * 0.42)

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: 700,
        color: 'white',
        fontFamily: 'var(--font-body)',
        boxShadow: showRing ? `0 0 0 2px var(--paper), 0 0 0 4px ${color}` : 'none',
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  )
}
