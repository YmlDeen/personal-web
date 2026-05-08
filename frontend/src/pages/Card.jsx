import { useEffect, useState } from 'react'

export default function Card() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'JetBrains Mono, monospace',
    }}>
      <div style={{
        width: '100%', maxWidth: '360px',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* card front */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* glow */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '180px', height: '180px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,106,247,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-40px', left: '-20px',
            width: '140px', height: '140px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '2px' }}>
                personal os
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.15)', letterSpacing: '-0.01em' }}>
                yml<span style={{ color: 'var(--accent)' }}>.</span>space
              </div>
            </div>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(124,106,247,0.3), rgba(45,212,191,0.2))',
              border: '1px solid rgba(124,106,247,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px',
            }}>◈</div>
          </div>

          {/* name */}
          <div style={{ marginBottom: '6px' }}>
            <h1 style={{
              fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: 800,
              color: '#f0f0fa', letterSpacing: '-0.03em', lineHeight: 1, margin: 0,
            }}>YmlDeen</h1>
          </div>
          <p style={{
            fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic',
            lineHeight: 1.5, marginBottom: '28px',
          }}>
            Builder · Tinkerer · Island-based dev.<br />
            Building things with a phone, one commit at a time.
          </p>

          {/* divider */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', marginBottom: '24px' }} />

          {/* links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: '◎', label: 'github', value: 'github.com/YmlDeen', href: 'https://github.com/YmlDeen' },
              { icon: '◉', label: 'web', value: 'ymldeen.duckdns.org:8443', href: 'https://ymldeen.duckdns.org:8443' },
            ].map(item => (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                textDecoration: 'none', padding: '8px 12px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.2s', cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,106,247,0.08)'; e.currentTarget.style.borderColor = 'rgba(124,106,247,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
              >
                <span style={{ fontSize: '12px', color: 'var(--accent)', flexShrink: 0 }}>{item.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</div>
                </div>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>↗</span>
              </a>
            ))}
          </div>

          {/* bottom */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['bugscan', 'linkbox', 'nexus'].map(p => (
                <span key={p} style={{
                  fontSize: '8px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '2px 6px',
                }}>{p}</span>
              ))}
            </div>
            <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em' }}>2026</div>
          </div>
        </div>

        {/* share hint */}
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>
          /card
        </div>
      </div>
    </div>
  )
}
