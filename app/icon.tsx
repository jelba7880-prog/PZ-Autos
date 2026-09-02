import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

// Code-generated stand-in for the real PZ Autos favicon PNG (see
// components/theme/Logo.tsx for why — the provided brand kit files never
// landed as real uploads in this environment). Swap for the authoritative
// asset once it's available as an actual file. Built from flex/div
// primitives rather than raw SVG — the ImageResponse (satori) renderer
// doesn't support <text>.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#141414',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ width: 10, height: 4, background: '#D0121B' }} />
          <div style={{ width: 7, height: 4, background: '#D0121B', marginLeft: 3 }} />
          <div style={{ width: 4, height: 4, background: '#D0121B', marginLeft: 6 }} />
        </div>
        <div style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 900 }}>PZ</div>
      </div>
    ),
    { ...size }
  )
}
