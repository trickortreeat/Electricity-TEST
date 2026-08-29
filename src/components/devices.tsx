import type { DeviceDef } from '../types';

// Общие градиенты — монтируются один раз в <svg>
export function SvgDefs() {
  return (
    <defs>
      <radialGradient id="bulbGlow" cx="50%" cy="42%" r="65%">
        <stop offset="0%" stopColor="#fff8dc" />
        <stop offset="45%" stopColor="#ffd75e" />
        <stop offset="100%" stopColor="#e8930c" />
      </radialGradient>
      <radialGradient id="bulbHalo" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(255,205,80,0.65)" />
        <stop offset="60%" stopColor="rgba(255,180,50,0.18)" />
        <stop offset="100%" stopColor="rgba(255,180,50,0)" />
      </radialGradient>
      <linearGradient id="moduleBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#d7e0ec" />
        <stop offset="100%" stopColor="#a9b7cc" />
      </linearGradient>
      <linearGradient id="darkBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#25334b" />
        <stop offset="100%" stopColor="#17202f" />
      </linearGradient>
    </defs>
  );
}

const MONO = "'JetBrains Mono', monospace";

// перенос длинной подписи на две строки, чтобы она не вылезала за пределы аппарата
function wrapLabel(text: string, max = 16): string[] {
  if (text.length <= max) return [text];
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length <= max) cur = (cur + ' ' + w).trim();
    else {
      if (cur) lines.push(cur);
      cur = w.length > max ? w.slice(0, max - 1) + '…' : w;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 2);
}

function DeviceLabel({ x, y, text, sub }: { x: number; y: number; text?: string; sub?: string }) {
  if (!text && !sub) return null;
  const lines = text ? wrapLabel(text) : [];
  const longest = Math.max(...lines.map((l) => l.length), sub?.length ?? 0, 1);
  const w = longest * 7.4 + 20;
  const h = lines.length * 15 + (sub ? 14 : 0) + 10;
  return (
    <g pointerEvents="none">
      {/* тёмная подложка, чтобы подпись всегда читалась поверх любых элементов */}
      <rect x={x - w / 2} y={y - 13} width={w} height={h} rx={7} fill="#070d16" opacity={0.9} stroke="#243149" strokeWidth={1} />
      {lines.map((l, i) => (
        <text key={i} x={x} y={y + i * 14} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#b9caea" fontFamily={MONO} letterSpacing={0.2}>
          {l}
        </text>
      ))}
      {sub && (
        <text x={x} y={y + lines.length * 14} textAnchor="middle" fontSize={10} fill="#7d8fb3" fontFamily={MONO}>
          {sub}
        </text>
      )}
    </g>
  );
}

// Универсальные «подводящие» линии от корпуса к клеммам
function Stubs({ d }: { d: DeviceDef }) {
  return (
    <g pointerEvents="none">
      {d.terminals.map((t) => (
        <line
          key={t.key}
          x1={d.x + t.dx * 0.7}
          y1={d.y + t.dy * 0.7}
          x2={d.x + t.dx}
          y2={d.y + t.dy}
          stroke="#475569"
          strokeWidth={5}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

function LED({ x, y, on, color = '#4ade80' }: { x: number; y: number; on: boolean; color?: string }) {
  if (!on) return null;
  return <circle cx={x} cy={y} r={3.5} fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }} />;
}

// ---- вводной кабель ----
function Cable({ d }: { d: DeviceDef }) {
  const { x, y } = d;
  const colors: Record<string, { main: string; second?: string }> = {
    L: { main: '#c96f2e' },
    N: { main: '#3d8bff' },
    PE: { main: '#35c759', second: '#ffd93d' },
  };
  return (
    <g>
      <rect x={-30} y={y - 34} width={x + 44} height={68} rx={14} fill="#141d2c" stroke="#2c3a55" strokeWidth={2} />
      <rect x={x - 34} y={y - 40} width={16} height={80} rx={5} fill="#1c293c" stroke="#33465f" strokeWidth={1.5} />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={x - 26} y1={y - 22 + i * 22} x2={x + 6} y2={y - 22 + i * 22} stroke="#33465f" strokeWidth={2} opacity={0.6} />
      ))}
      {d.terminals.map((t) => {
        const c = colors[t.key] ?? colors.L;
        const tx = x + t.dx;
        const ty = y + t.dy;
        const mx = (x + 8 + tx) / 2;
        return (
          <g key={t.key}>
            <path d={`M ${x + 6} ${y} Q ${mx} ${ty} ${tx} ${ty}`} fill="none" stroke="#0a0f18" strokeWidth={11} strokeLinecap="round" />
            <path d={`M ${x + 6} ${y} Q ${mx} ${ty} ${tx} ${ty}`} fill="none" stroke={c.main} strokeWidth={8} strokeLinecap="round" />
            {c.second && (
              <path d={`M ${x + 6} ${y} Q ${mx} ${ty} ${tx} ${ty}`} fill="none" stroke={c.second} strokeWidth={8} strokeLinecap="round" strokeDasharray="9 9" strokeDashoffset={5} />
            )}
          </g>
        );
      })}
      <DeviceLabel x={x + 30} y={y - 58} text={d.label} />
    </g>
  );
}

// ---- клеммник (Wago) ----
function Hub({ d }: { d: DeviceDef }) {
  const maxAbs = Math.max(...d.terminals.map((t) => Math.abs(t.dx)));
  const w = maxAbs * 2 + 56;
  return (
    <g>
      <rect x={d.x - w / 2} y={d.y - 21} width={w} height={42} rx={10} fill="rgba(245,158,11,0.10)" stroke="rgba(245,158,11,0.55)" strokeWidth={1.6} />
      {d.terminals.map((t) => (
        <rect key={t.key} x={d.x + t.dx - 14} y={d.y - 21} width={28} height={9} rx={3.5} fill="#f59e0b" opacity={0.75} />
      ))}
      <DeviceLabel x={d.x} y={d.y + 46} text={d.label} />
    </g>
  );
}

// ---- шины N и PE ----
function Bus({ d, kind }: { d: DeviceDef; kind: 'N' | 'PE' }) {
  const maxAbs = Math.max(...d.terminals.map((t) => Math.abs(t.dx)));
  const w = maxAbs * 2 + 60;
  const stroke = kind === 'N' ? 'rgba(61,139,255,0.65)' : 'rgba(53,199,89,0.65)';
  const fill = kind === 'N' ? 'rgba(61,139,255,0.10)' : 'rgba(53,199,89,0.10)';
  return (
    <g>
      <rect x={d.x - w / 2} y={d.y - 16} width={w} height={32} rx={8} fill={fill} stroke={stroke} strokeWidth={1.6} />
      <line x1={d.x - w / 2 + 12} y1={d.y} x2={d.x + w / 2 - 12} y2={d.y} stroke="#8b94a7" strokeWidth={3} opacity={0.5} strokeLinecap="round" />
      <DeviceLabel x={d.x} y={d.y + 40} text={d.label} />
    </g>
  );
}

// ---- гребенчатая шина ----
function Comb({ d }: { d: DeviceDef }) {
  const xs = d.terminals.map((t) => t.dx);
  const min = Math.min(...xs);
  const max = Math.max(...xs);
  return (
    <g>
      <rect x={d.x + min - 18} y={d.y - 7} width={max - min + 36} height={14} rx={5} fill="#d97706" stroke="#92400e" strokeWidth={1.5} opacity={0.95} />
      {d.terminals.map((t) => (
        <rect key={t.key} x={d.x + t.dx - 5} y={d.y - 16} width={10} height={20} rx={2.5} fill="#b45309" stroke="#78350f" strokeWidth={1} />
      ))}
      <DeviceLabel x={d.x} y={d.y + 34} text={d.label} />
    </g>
  );
}

// ---- корпуса выключателей ----
function SwitchPlate({ d, powered, on, glyph, labelY = 92 }: { d: DeviceDef; powered: boolean; on: boolean; glyph: 's1' | 's2' | 'p' | 'x' | 'dim'; labelY?: number }) {
  return (
    <g>
      <Stubs d={d} />
      <rect x={d.x - 40} y={d.y - 40} width={80} height={80} rx={12} fill="url(#darkBody)" stroke="#3c4d6e" strokeWidth={2} />
      <rect x={d.x - 30} y={d.y - 30} width={60} height={60} rx={8} fill="#101828" stroke="#2c3a55" strokeWidth={1.5} />
      {glyph === 's1' && (
        <>
          <rect x={d.x - 14} y={d.y - 22} width={28} height={44} rx={6} fill={on ? '#2e3d5a' : '#1b2740'} stroke="#46587e" strokeWidth={1.5} />
          <line x1={d.x - 10} y1={on ? d.y - 14 : d.y + 6} x2={d.x + 10} y2={on ? d.y - 14 : d.y + 6} stroke="#5c7196" strokeWidth={3} strokeLinecap="round" style={{ transition: 'all .25s' }} />
        </>
      )}
      {glyph === 's2' && (
        <>
          <rect x={d.x - 27} y={d.y - 20} width={24} height={40} rx={5} fill={on ? '#2e3d5a' : '#1b2740'} stroke="#46587e" strokeWidth={1.5} />
          <rect x={d.x + 3} y={d.y - 20} width={24} height={40} rx={5} fill={on ? '#2e3d5a' : '#1b2740'} stroke="#46587e" strokeWidth={1.5} />
        </>
      )}
      {glyph === 'p' && (
        <>
          <path d={`M ${d.x - 18} ${d.y + 10} L ${d.x + 18} ${on ? d.y - 10 : d.y + 14}`} stroke="#8fa3c8" strokeWidth={5} strokeLinecap="round" style={{ transition: 'all .25s' }} />
          <circle cx={d.x - 18} cy={d.y + 10} r={4} fill="#8fa3c8" />
          <circle cx={d.x + 18} cy={d.y - 10} r={4} fill={on ? '#ffc42e' : '#5c7196'} />
          <circle cx={d.x + 18} cy={d.y + 14} r={4} fill={on ? '#5c7196' : '#ffc42e'} />
        </>
      )}
      {glyph === 'x' && (
        <>
          <path
            d={on ? `M ${d.x - 18} ${d.y - 12} L ${d.x + 18} ${d.y - 12} M ${d.x - 18} ${d.y + 12} L ${d.x + 18} ${d.y + 12}` : `M ${d.x - 18} ${d.y - 12} L ${d.x + 18} ${d.y + 12} M ${d.x - 18} ${d.y + 12} L ${d.x + 18} ${d.y - 12}`}
            stroke="#8fa3c8"
            strokeWidth={5}
            strokeLinecap="round"
          />
        </>
      )}
      {glyph === 'dim' && (
        <>
          <circle cx={d.x} cy={d.y} r={17} fill="#1b2740" stroke="#46587e" strokeWidth={2} />
          <line x1={d.x} y1={d.y} x2={d.x + (on ? 10 : -11)} y2={d.y + (on ? -11 : 11)} stroke="#8fa3c8" strokeWidth={3.5} strokeLinecap="round" style={{ transition: 'all .25s' }} />
          <path d={`M ${d.x - 24} ${d.y + 24} A 30 30 0 0 1 ${d.x + 24} ${d.y + 24}`} fill="none" stroke="#46587e" strokeWidth={2} strokeDasharray="2 5" />
        </>
      )}
      <LED x={d.x + 24} y={d.y - 24} on={powered} />
      <DeviceLabel x={d.x} y={d.y + labelY} text={d.label} />
    </g>
  );
}

// ---- лампы ----
function Bulb({ cx, cy, r, on }: { cx: number; cy: number; r: number; on: boolean }) {
  return (
    <g>
      {on && (
        <>
          <circle cx={cx} cy={cy} r={r * 2.2} fill="url(#bulbHalo)" />
          <circle cx={cx} cy={cy} r={r * 1.3} fill="url(#bulbHalo)" className="glow-amber" />
        </>
      )}
      <circle cx={cx} cy={cy} r={r} fill={on ? 'url(#bulbGlow)' : 'rgba(148,163,184,0.10)'} stroke={on ? '#fbbf24' : '#64748b'} strokeWidth={2.5} style={{ transition: 'fill .4s' }} />
      <polyline
        points={`${cx - r * 0.36},${cy + r * 0.36} ${cx - r * 0.18},${cy - r * 0.1} ${cx},${cy + r * 0.26} ${cx + r * 0.18},${cy - r * 0.1} ${cx + r * 0.36},${cy + r * 0.36}`}
        fill="none"
        stroke={on ? '#7c2d12' : '#64748b'}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function Lamp({ d, powered }: { d: DeviceDef; powered: boolean }) {
  return (
    <g>
      <Stubs d={d} />
      <rect x={d.x - 58} y={d.y - 16} width={116} height={32} rx={10} fill="url(#darkBody)" stroke="#3c4d6e" strokeWidth={2} />
      <rect x={d.x - 14} y={d.y + 26} width={28} height={20} rx={4} fill="#8b94a7" stroke="#5b6577" strokeWidth={1.5} />
      <Bulb cx={d.x} cy={d.y + 78} r={38} on={powered} />
      <DeviceLabel x={d.x} y={d.y - 30} text={d.label} />
    </g>
  );
}

function Lamp2({ d, powered }: { d: DeviceDef; powered: boolean }) {
  return (
    <g>
      <Stubs d={d} />
      <rect x={d.x - 78} y={d.y - 16} width={156} height={32} rx={10} fill="url(#darkBody)" stroke="#3c4d6e" strokeWidth={2} />
      <line x1={d.x - 42} y1={d.y + 16} x2={d.x - 42} y2={d.y + 34} stroke="#8b94a7" strokeWidth={9} />
      <line x1={d.x + 42} y1={d.y + 16} x2={d.x + 42} y2={d.y + 34} stroke="#8b94a7" strokeWidth={9} />
      <Bulb cx={d.x - 42} cy={d.y + 72} r={30} on={powered} />
      <Bulb cx={d.x + 42} cy={d.y + 72} r={30} on={powered} />
      <DeviceLabel x={d.x} y={d.y - 30} text={d.label} />
    </g>
  );
}

function LampS({ d, powered }: { d: DeviceDef; powered: boolean }) {
  return (
    <g>
      <Stubs d={d} />
      <rect x={d.x - 46} y={d.y - 11} width={92} height={22} rx={8} fill="url(#darkBody)" stroke="#3c4d6e" strokeWidth={2} />
      <Bulb cx={d.x} cy={d.y + 44} r={26} on={powered} />
      {/* подпись поднята выше клемм, чтобы не перекрывалась */}
      <DeviceLabel x={d.x} y={d.y - 56} text={d.label} />
    </g>
  );
}

// ---- розетка ----
function Socket({ d, powered }: { d: DeviceDef; powered: boolean }) {
  return (
    <g>
      <Stubs d={d} />
      <rect x={d.x - 56} y={d.y - 56} width={112} height={112} rx={16} fill="url(#darkBody)" stroke="#3c4d6e" strokeWidth={2} />
      <circle cx={d.x} cy={d.y} r={37} fill="#0b111e" stroke="#33465f" strokeWidth={2} />
      <rect x={d.x - 17} y={d.y - 11} width={11} height={24} rx={4} fill="#060a12" stroke="#2c3a55" strokeWidth={1.5} />
      <rect x={d.x + 6} y={d.y - 11} width={11} height={24} rx={4} fill="#060a12" stroke="#2c3a55" strokeWidth={1.5} />
      <path d={`M ${d.x - 12} ${d.y - 34} Q ${d.x} ${d.y - 26} ${d.x + 12} ${d.y - 34}`} fill="none" stroke="#35c759" strokeWidth={3.5} strokeLinecap="round" />
      <path d={`M ${d.x - 12} ${d.y + 34} Q ${d.x} ${d.y + 26} ${d.x + 12} ${d.y + 34}`} fill="none" stroke="#35c759" strokeWidth={3.5} strokeLinecap="round" />
      <LED x={d.x + 42} y={d.y - 42} on={powered} />
      <DeviceLabel x={d.x} y={d.y + 122} text={d.label} />
    </g>
  );
}

// ---- модульные аппараты на DIN-рейке ----
function Module({ d, powered, on }: { d: DeviceDef; powered: boolean; on: boolean }) {
  const kind = d.type;
  const width = kind === 'rcd' || kind === 'dif' || kind === 'breaker2p' ? 100 : 54;
  const hTop = -70;
  const hBot = 70;
  const isBreaker = kind === 'breaker';
  const title =
    kind === 'rcd'
      ? d.sublabel?.includes('100')
        ? 'УЗО-S'
        : 'УЗО'
      : kind === 'dif'
        ? 'АВДТ'
        : kind === 'vrn'
          ? 'РН'
          : kind === 'uzip'
            ? 'УЗИП'
            : kind === 'breaker2p'
              ? d.label?.split(' ').pop()
              : d.label?.split(' ').pop();
  return (
    <g>
      <rect x={d.x - width / 2} y={d.y + hTop} width={width} height={hBot - hTop} rx={7} fill="url(#moduleBody)" stroke="#7d8ba1" strokeWidth={2} />
      <rect x={d.x - width / 2 + 5} y={d.y + hTop + 5} width={width - 10} height={10} rx={4} fill="#8b98ad" opacity={0.55} />
      {d.terminals.map((t) => (
        <rect key={t.key} x={d.x + t.dx - 13} y={d.y + t.dy - 8} width={26} height={16} rx={4} fill="#6d7a90" stroke="#4c586e" strokeWidth={1.4} />
      ))}

      {isBreaker && (
        <>
          <rect x={d.x - 8} y={d.y - 26} width={16} height={46} rx={4} fill="#161e2c" />
          <rect x={d.x - 6} y={on ? d.y - 24 : d.y - 2} width={12} height={20} rx={3} fill={on ? '#0b0f16' : '#b91c1c'} style={{ transition: 'all .3s cubic-bezier(.6,-0.2,.3,1.4)' }} />
          <text x={d.x} y={d.y + 36} textAnchor="middle" fontSize={10} fontWeight={700} fill="#3c475c" fontFamily={MONO}>
            {on ? 'I' : 'O'}
          </text>
        </>
      )}

      {kind === 'breaker2p' && (
        <>
          <rect x={d.x - 34} y={d.y - 24} width={16} height={42} rx={4} fill="#161e2c" />
          <rect x={d.x + 18} y={d.y - 24} width={16} height={42} rx={4} fill="#161e2c" />
          <rect x={d.x - 32} y={on ? d.y - 22 : d.y - 2} width={12} height={18} rx={3} fill={on ? '#0b0f16' : '#b91c1c'} style={{ transition: 'all .3s' }} />
          <rect x={d.x + 20} y={on ? d.y - 22 : d.y - 2} width={12} height={18} rx={3} fill={on ? '#0b0f16' : '#b91c1c'} style={{ transition: 'all .3s' }} />
          <rect x={d.x - 24} y={on ? d.y - 14 : d.y + 6} width={48} height={5} rx={2} fill={on ? '#0b0f16' : '#b91c1c'} style={{ transition: 'all .3s' }} />
          <text x={d.x} y={d.y + 44} textAnchor="middle" fontSize={10} fontWeight={700} fill="#3c475c" fontFamily={MONO}>
            {on ? 'I' : 'O'}
          </text>
        </>
      )}

      {(kind === 'rcd' || kind === 'dif') && (
        <>
          <rect x={d.x + 12 - 8} y={d.y - 26} width={16} height={46} rx={4} fill="#161e2c" />
          <rect x={d.x + 12 - 6} y={on ? d.y - 24 : d.y - 2} width={12} height={20} rx={3} fill={on ? '#0b0f16' : '#b91c1c'} style={{ transition: 'all .3s' }} />
          <circle cx={d.x - 22} cy={d.y - 22} r={11} fill="#fbbf24" stroke="#b45309" strokeWidth={1.6} />
          <text x={d.x - 22} y={d.y - 18} textAnchor="middle" fontSize={12} fontWeight={800} fill="#78350f" fontFamily={MONO}>
            T
          </text>
          <text x={d.x - 22} y={d.y + 2} textAnchor="middle" fontSize={9} fontWeight={600} fill="#57637a" fontFamily={MONO}>
            тест
          </text>
          {kind === 'dif' && (
            <text x={d.x - 24} y={d.y + 38} textAnchor="middle" fontSize={13} fontWeight={700} fill="#57637a" fontFamily={MONO}>
              Δ
            </text>
          )}
          <text x={d.x + 12} y={d.y + 36} textAnchor="middle" fontSize={10} fontWeight={700} fill="#3c475c" fontFamily={MONO}>
            {on ? 'I' : 'O'}
          </text>
        </>
      )}

      {kind === 'vrn' && (
        <>
          <rect x={d.x - 19} y={d.y - 34} width={38} height={24} rx={4} fill="#0b111e" stroke="#33465f" strokeWidth={1.5} />
          <text x={d.x} y={d.y - 17} textAnchor="middle" fontSize={13} fontWeight={700} fill={powered && on ? '#4ade80' : '#f87171'} fontFamily={MONO}>
            {powered && on ? '230' : '---'}
          </text>
          <text x={d.x} y={d.y + 6} textAnchor="middle" fontSize={8.5} fontWeight={600} fill="#57637a" fontFamily={MONO}>
            U-порог 170–250 В
          </text>
          <rect x={d.x - 8} y={d.y + 16} width={16} height={30} rx={4} fill="#161e2c" />
          <rect x={d.x - 6} y={on ? d.y + 18 : d.y + 28} width={12} height={14} rx={3} fill={on ? '#0b0f16' : '#b91c1c'} style={{ transition: 'all .3s' }} />
        </>
      )}

      {kind === 'uzip' && (
        <>
          <circle cx={d.x} cy={d.y - 14} r={17} fill={powered ? 'rgba(255,196,46,0.25)' : 'rgba(60,71,92,0.4)'} stroke={powered ? '#ffc42e' : '#57637a'} strokeWidth={2} />
          <polyline
            points={`${d.x + 4},${d.y - 25} ${d.x - 6},${d.y - 9} ${d.x},${d.y - 9} ${d.x - 4},${d.y - 3} ${d.x + 6},${d.y - 19} ${d.x - 1},${d.y - 19}`}
            fill={powered ? '#ffc42e' : '#57637a'}
            stroke="none"
          />
          <text x={d.x} y={d.y + 22} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#3c475c" fontFamily={MONO}>
            класс II
          </text>
          <rect x={d.x - 12} y={d.y + 34} width={24} height={14} rx={3} fill={powered ? '#16a34a' : '#dc2626'} style={{ transition: 'fill .3s' }} />
        </>
      )}

      {/* верхняя маркировочная табличка — как на реальном аппарате */}
      <rect x={d.x - width / 2 + 5} y={d.y - 56} width={width - 10} height={19} rx={3} fill="#f8fafc" stroke="#94a3b8" strokeWidth={1} />
      <text x={d.x} y={d.y - 42} textAnchor="middle" fontSize={13} fontWeight={800} fill="#0f172a" fontFamily={MONO} letterSpacing={0.3}>
        {title}
      </text>
      {/* нижняя строка характеристик */}
      <rect x={d.x - width / 2 + 5} y={d.y + 44} width={width - 10} height={17} rx={3} fill="#eef2f7" stroke="#a8b3c4" strokeWidth={0.8} />
      <text x={d.x} y={d.y + 56} textAnchor="middle" fontSize={width > 70 ? 9.5 : 8} fontWeight={700} fill="#1e293b" fontFamily={MONO}>
        {(d.sublabel ?? '').slice(0, width > 70 ? 16 : 8)}
      </text>
      {/* стандартные надписи корпуса */}
      <text x={d.x} y={d.y + 68} textAnchor="middle" fontSize={6.5} fontWeight={600} fill="#64748b" fontFamily={MONO}>
        {kind === 'breaker3p' || kind === 'breaker2p' ? '~400V  6000  3' : '~230V  6000  3'}
      </text>
      {kind !== 'uzip' && <rect x={d.x + width / 2 - 14} y={d.y - 32} width={8} height={8} rx={2} fill={powered ? '#16a34a' : '#dc2626'} style={{ transition: 'fill .3s' }} />}
      <DeviceLabel x={d.x} y={d.y + 118} text={d.label} />
    </g>
  );
}

// ---- счётчик ----
function Meter({ d, powered }: { d: DeviceDef; powered: boolean }) {
  return (
    <g>
      <Stubs d={d} />
      <rect x={d.x - 66} y={d.y - 86} width={132} height={172} rx={10} fill="#1b2436" stroke="#3c4d6e" strokeWidth={2} />
      <rect x={d.x - 48} y={d.y - 62} width={96} height={34} rx={5} fill="#0b111e" stroke="#33465f" strokeWidth={1.5} />
      <text x={d.x} y={d.y - 39} textAnchor="middle" fontSize={19} fontWeight={700} fill={powered ? '#9ff0b6' : '#31502f'} fontFamily={MONO} letterSpacing={3}>
        00138.7
      </text>
      <text x={d.x} y={d.y - 8} textAnchor="middle" fontSize={9.5} fill="#64748f" fontFamily={MONO}>
        кВт·ч · однофазный
      </text>
      <g>
        {d.terminals.map((t, i) => (
          <text key={t.key} x={d.x + t.dx} y={d.y + t.dy - 16} textAnchor="middle" fontSize={11} fontWeight={700} fill="#7d92b8" fontFamily={MONO}>
            {i + 1}
          </text>
        ))}
      </g>
      <LED x={d.x - 40} y={d.y + 40} on={powered} color="#f87171" />
      <text x={d.x + 8} y={d.y + 44} textAnchor="middle" fontSize={9} fill="#64748f" fontFamily={MONO}>
        имп/кВт·ч
      </text>
      <DeviceLabel x={d.x} y={d.y + 118} text={d.label} />
    </g>
  );
}

// ---- датчик движения ----
function Pir({ d, powered }: { d: DeviceDef; powered: boolean }) {
  return (
    <g>
      <Stubs d={d} />
      <rect x={d.x - 46} y={d.y - 28} width={92} height={60} rx={26} fill="#dde4ee" stroke="#94a3b8" strokeWidth={2} />
      <circle cx={d.x} cy={d.y} r={20} fill={powered ? '#ffd75e' : '#cfd8e6'} stroke="#94a3b8" strokeWidth={2} style={{ transition: 'fill .4s' }} />
      <circle cx={d.x} cy={d.y} r={20} fill="none" stroke="rgba(60,70,90,0.35)" strokeWidth={1} strokeDasharray="3 4" />
      <circle cx={d.x} cy={d.y - 7} r={4.5} fill="rgba(120,130,150,0.5)" />
      <circle cx={d.x - 9} cy={d.y + 6} r={4.5} fill="rgba(120,130,150,0.5)" />
      <circle cx={d.x + 9} cy={d.y + 6} r={4.5} fill="rgba(120,130,150,0.5)" />
      <LED x={d.x + 34} y={d.y - 18} on={powered} color="#f87171" />
      <DeviceLabel x={d.x} y={d.y + 92} text={d.label} />
    </g>
  );
}

// ---- терморегулятор ----
function Thermostat({ d, powered }: { d: DeviceDef; powered: boolean }) {
  return (
    <g>
      <Stubs d={d} />
      <rect x={d.x - 52} y={d.y - 40} width={104} height={80} rx={12} fill="url(#darkBody)" stroke="#3c4d6e" strokeWidth={2} />
      <rect x={d.x - 34} y={d.y - 28} width={68} height={26} rx={5} fill="#0b111e" stroke="#33465f" strokeWidth={1.5} />
      <text x={d.x} y={d.y - 10} textAnchor="middle" fontSize={15} fontWeight={700} fill={powered ? '#ffb254' : '#3c4d6e'} fontFamily={MONO}>
        {powered ? '26.5°' : '--.-'}
      </text>
      <circle cx={d.x - 16} cy={d.y + 16} r={8} fill="#101828" stroke="#46587e" strokeWidth={1.5} />
      <circle cx={d.x + 16} cy={d.y + 16} r={8} fill="#101828" stroke="#46587e" strokeWidth={1.5} />
      <text x={d.x - 16} y={d.y + 20} textAnchor="middle" fontSize={10} fill="#8fa3c8" fontFamily={MONO}>−</text>
      <text x={d.x + 16} y={d.y + 20} textAnchor="middle" fontSize={10} fill="#8fa3c8" fontFamily={MONO}>+</text>
      <LED x={d.x + 40} y={d.y - 28} on={powered} color="#ffb254" />
      <DeviceLabel x={d.x} y={d.y + 92} text={d.label} />
    </g>
  );
}

// ---- бытовые приборы ----
function Stove({ d, powered }: { d: DeviceDef; powered: boolean }) {
  const zones = [
    { x: -26, y: -18, r: 13 },
    { x: 26, y: -18, r: 11 },
    { x: -26, y: 18, r: 11 },
    { x: 26, y: 18, r: 13 },
  ];
  return (
    <g>
      <Stubs d={d} />
      <rect x={d.x - 64} y={d.y - 43} width={128} height={86} rx={10} fill="#0d1524" stroke="#3c4d6e" strokeWidth={2} />
      {zones.map((z, i) => (
        <circle
          key={i}
          cx={d.x + z.x}
          cy={d.y + z.y}
          r={z.r}
          fill="none"
          stroke={powered ? '#ef4444' : '#3c4d6e'}
          strokeWidth={3}
          style={powered ? { filter: 'drop-shadow(0 0 6px #ef4444)' } : undefined}
        />
      ))}
      <line x1={d.x - 52} y1={d.y + 33} x2={d.x + 52} y2={d.y + 33} stroke="#26334c" strokeWidth={3} />
      <DeviceLabel x={d.x} y={d.y + 68} text={d.label} />
    </g>
  );
}

function Washer({ d, powered }: { d: DeviceDef; powered: boolean }) {
  return (
    <g>
      <Stubs d={d} />
      <rect x={d.x - 43} y={d.y - 48} width={86} height={96} rx={10} fill="url(#moduleBody)" stroke="#7d8ba1" strokeWidth={2} />
      <circle cx={d.x} cy={d.y + 10} r={27} fill="#101828" stroke="#57637a" strokeWidth={3} />
      <circle cx={d.x} cy={d.y + 10} r={19} fill={powered ? 'rgba(61,139,255,0.25)' : '#1b2436'} stroke="#3c475c" strokeWidth={1.5} />
      {powered && <path d={`M ${d.x - 16} ${d.y + 14} Q ${d.x} ${d.y + 26} ${d.x + 16} ${d.y + 14}`} fill="none" stroke="#3d8bff" strokeWidth={3} strokeLinecap="round" />}
      <rect x={d.x - 34} y={d.y - 40} width={40} height={10} rx={3} fill="#101828" stroke="#3c475c" strokeWidth={1} />
      <circle cx={d.x + 26} cy={d.y - 35} r={5} fill="#101828" stroke="#3c475c" strokeWidth={1.2} />
      <LED x={d.x + 26} y={d.y - 35} on={powered} />
      <DeviceLabel x={d.x} y={d.y + 72} text={d.label} />
    </g>
  );
}

function Oven({ d, powered }: { d: DeviceDef; powered: boolean }) {
  return (
    <g>
      <Stubs d={d} />
      <rect x={d.x - 46} y={d.y - 42} width={92} height={84} rx={10} fill="url(#moduleBody)" stroke="#7d8ba1" strokeWidth={2} />
      <rect x={d.x - 32} y={d.y - 14} width={64} height={44} rx={5} fill="#101828" stroke="#3c475c" strokeWidth={1.5} />
      <line x1={d.x - 32} y1={d.y - 22} x2={d.x + 32} y2={d.y - 22} stroke="#57637a" strokeWidth={4} strokeLinecap="round" />
      <circle cx={d.x - 20} cy={d.y - 32} r={5} fill={powered ? '#ffb254' : '#101828'} stroke="#3c475c" strokeWidth={1.2} />
      <circle cx={d.x - 6} cy={d.y - 32} r={5} fill="#101828" stroke="#3c475c" strokeWidth={1.2} />
      <rect x={d.x + 14} y={d.y - 36} width={20} height={8} rx={2.5} fill="#101828" stroke="#3c475c" strokeWidth={1} />
      {powered && <line x1={d.x - 26} y1={d.y + 22} x2={d.x + 26} y2={d.y + 22} stroke="#ef4444" strokeWidth={3} opacity={0.8} style={{ filter: 'drop-shadow(0 0 4px #ef4444)' }} />}
      <DeviceLabel x={d.x} y={d.y + 66} text={d.label} />
    </g>
  );
}

function AC({ d, powered }: { d: DeviceDef; powered: boolean }) {
  return (
    <g>
      <Stubs d={d} />
      <rect x={d.x - 69} y={d.y - 26} width={138} height={52} rx={14} fill="url(#moduleBody)" stroke="#7d8ba1" strokeWidth={2} />
      <line x1={d.x - 54} y1={d.y - 6} x2={d.x + 54} y2={d.y - 6} stroke="#8b98ad" strokeWidth={2.5} strokeLinecap="round" />
      <line x1={d.x - 54} y1={d.y + 4} x2={d.x + 54} y2={d.y + 4} stroke="#8b98ad" strokeWidth={2.5} strokeLinecap="round" />
      <rect x={d.x - 54} y={d.y + 12} width={108} height={7} rx={3.5} fill="#8b98ad" opacity={0.7} />
      {powered && (
        <text x={d.x + 40} y={d.y - 14} textAnchor="middle" fontSize={9} fontWeight={700} fill="#16a34a" fontFamily={MONO}>
          22°
        </text>
      )}
      <LED x={d.x + 58} y={d.y - 14} on={powered} />
      <DeviceLabel x={d.x} y={d.y + 50} text={d.label} />
    </g>
  );
}

function Boiler({ d, powered }: { d: DeviceDef; powered: boolean }) {
  return (
    <g>
      <Stubs d={d} />
      <rect x={d.x - 35} y={d.y - 55} width={70} height={110} rx={26} fill="url(#moduleBody)" stroke="#7d8ba1" strokeWidth={2} />
      <rect x={d.x - 24} y={d.y + 8} width={48} height={10} rx={5} fill="#8b98ad" opacity={0.6} />
      <rect x={d.x - 20} y={d.y - 26} width={40} height={18} rx={4} fill="#101828" stroke="#3c475c" strokeWidth="1" />
      <text x={d.x} y={d.y - 13} textAnchor="middle" fontSize={11} fontWeight={700} fill={powered ? '#ff7a54' : '#3c4d6e'} fontFamily={MONO}>
        {powered ? '65°' : '--'}
      </text>
      <LED x={d.x} y={d.y + 34} on={powered} color="#ff7a54" />
      <DeviceLabel x={d.x} y={d.y + 80} text={d.label} />
    </g>
  );
}

function FloorHeat({ d, powered }: { d: DeviceDef; powered: boolean }) {
  const w = 170;
  const h = 110;
  const pipe = `M ${d.x - 62} ${d.y - 30} h 124 v 16 h -124 v 16 h 124 v 16 h -124 v 16`;
  return (
    <g>
      <Stubs d={d} />
      <rect x={d.x - w / 2} y={d.y - h / 2} width={w} height={h} rx={10} fill="rgba(96,128,180,0.07)" stroke="#33465f" strokeWidth={1.8} strokeDasharray="8 6" />
      <path d={pipe} fill="none" stroke="#0a0f18" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={pipe}
        fill="none"
        stroke={powered ? '#f97316' : '#64748b'}
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={powered ? { filter: 'drop-shadow(0 0 6px #f97316aa)' } : undefined}
      />
      <DeviceLabel x={d.x} y={d.y + h / 2 + 22} text={d.label} />
    </g>
  );
}

// ---- кросс-модуль ----
function Cross({ d, powered }: { d: DeviceDef; powered: boolean }) {
  const rows = ['L1', 'L2', 'L3', 'N'];
  const colors = ['#c96f2e', '#1f2937', '#c05621', '#3d8bff'];
  return (
    <g>
      <rect x={d.x - 120} y={d.y - 58} width={240} height={116} rx={8} fill="url(#moduleBody)" stroke="#7d8ba1" strokeWidth={2} />
      {rows.map((r, i) => (
        <g key={r}>
          <rect x={d.x - 110} y={d.y - 48 + i * 26} width={220} height={20} rx={4} fill={colors[i]} opacity={powered ? 0.85 : 0.45} style={{ transition: 'opacity .4s' }} />
          <text x={d.x - 102} y={d.y - 34 + i * 26} fontSize={11} fontWeight={800} fill="#0b1220" fontFamily={MONO}>
            {r}
          </text>
        </g>
      ))}
      {d.terminals.map((t) => (
        <rect key={t.key} x={d.x + t.dx - 9} y={d.y + t.dy - 7} width={18} height={14} rx={3} fill="#5b6577" stroke="#3c475c" strokeWidth={1.2} />
      ))}
      <DeviceLabel x={d.x} y={d.y + 82} text={d.label} sub={d.sublabel} />
    </g>
  );
}

// ---- модульный контактор ----
function Contactor({ d, powered }: { d: DeviceDef; powered: boolean }) {
  return (
    <g>
      <rect x={d.x - 54} y={d.y - 70} width={108} height={140} rx={7} fill="url(#moduleBody)" stroke="#7d8ba1" strokeWidth={2} />
      <rect x={d.x - 49} y={d.y - 65} width={98} height={10} rx={4} fill="#8b98ad" opacity={0.55} />
      {d.terminals.map((t) => (
        <rect key={t.key} x={d.x + t.dx - 13} y={d.y + t.dy - 8} width={26} height={16} rx={4} fill="#6d7a90" stroke="#4c586e" strokeWidth={1.4} />
      ))}
      <rect x={d.x - 30} y={d.y - 26} width={60} height={44} rx={6} fill="#101828" stroke="#3c475c" strokeWidth={1.5} />
      {/* катушка + якорь */}
      <rect x={d.x - 22} y={d.y - 18} width={20} height={28} rx={3} fill="#57637a" />
      <rect x={d.x + 4} y={powered ? d.y - 18 : d.y - 8} width={18} height={22} rx={3} fill={powered ? '#ffc42e' : '#3c475c'} style={{ transition: 'all .3s' }} />
      <text x={d.x} y={d.y + 34} textAnchor="middle" fontSize={10} fontWeight={700} fill="#3c475c" fontFamily={MONO}>
        {powered ? 'ВКЛ' : 'ОТКЛ'}
      </text>
      <text x={d.x} y={d.y - 38} textAnchor="middle" fontSize={12} fontWeight={800} fill="#26314a" fontFamily={MONO}>
        КМ
      </text>
      <text x={d.x} y={d.y + 54} textAnchor="middle" fontSize={9.5} fontWeight={600} fill="#57637a" fontFamily={MONO}>
        {d.sublabel ?? ''}
      </text>
      <DeviceLabel x={d.x} y={d.y + 100} text={d.label} />
    </g>
  );
}

// ---- зарядная станция EV ----
function EV({ d, powered }: { d: DeviceDef; powered: boolean }) {
  return (
    <g>
      <Stubs d={d} />
      <rect x={d.x - 44} y={d.y - 62} width={88} height={124} rx={16} fill="#16202f" stroke="#3c4d6e" strokeWidth={2} />
      <rect x={d.x - 30} y={d.y - 48} width={60} height={36} rx={6} fill="#0b111e" stroke="#33465f" strokeWidth={1.5} />
      <text x={d.x} y={d.y - 24} textAnchor="middle" fontSize={13} fontWeight={700} fill={powered ? '#4ade80' : '#31502f'} fontFamily={MONO}>
        {powered ? '7.4kW' : '--'}
      </text>
      <circle cx={d.x} cy={d.y + 16} r={19} fill="#0b111e" stroke={powered ? '#4ade80' : '#33465f'} strokeWidth={2.5} style={{ transition: 'stroke .4s' }} />
      <polyline
        points={`${d.x + 5},${d.y + 2} ${d.x - 6},${d.y + 18} ${d.x + 1},${d.y + 18} ${d.x - 4},${d.y + 30} ${d.x + 8},${d.y + 12} ${d.x},${d.y + 12}`}
        fill={powered ? '#4ade80' : '#3c4d6e'}
        style={{ transition: 'fill .4s' }}
      />
      <path d={`M ${d.x + 30} ${d.y + 46} q 26 6 22 34`} fill="none" stroke="#0a0f18" strokeWidth={9} strokeLinecap="round" />
      <path d={`M ${d.x + 30} ${d.y + 46} q 26 6 22 34`} fill="none" stroke={powered ? '#4ade80' : '#475569'} strokeWidth={5} strokeLinecap="round" style={{ transition: 'stroke .4s' }} />
      <LED x={d.x + 30} y={d.y - 52} on={powered} />
      <DeviceLabel x={d.x} y={d.y + 96} text={d.label} sub={d.sublabel} />
    </g>
  );
}

// ---- балансировщик мощности ----
function EVBox({ d, powered }: { d: DeviceDef; powered: boolean }) {
  return (
    <g>
      <rect x={d.x - 60} y={d.y - 70} width={120} height={140} rx={7} fill="url(#moduleBody)" stroke="#7d8ba1" strokeWidth={2} />
      {d.terminals.map((t) => (
        <rect key={t.key} x={d.x + t.dx - 13} y={d.y + t.dy - 8} width={26} height={16} rx={4} fill="#6d7a90" stroke="#4c586e" strokeWidth={1.4} />
      ))}
      <rect x={d.x - 42} y={d.y - 34} width={84} height={38} rx={5} fill="#0b111e" stroke="#33465f" strokeWidth={1.5} />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={d.x - 34 + i * 24}
          y={powered ? d.y - 12 - i * 6 : d.y - 4}
          width={16}
          height={powered ? 14 + i * 6 : 6}
          rx={2}
          fill={powered ? '#4ade80' : '#33465f'}
          style={{ transition: 'all .4s' }}
        />
      ))}
      <text x={d.x} y={d.y + 22} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#26314a" fontFamily={MONO}>
        LOAD BALANCE
      </text>
      <text x={d.x} y={d.y + 40} textAnchor="middle" fontSize={9.5} fontWeight={600} fill="#57637a" fontFamily={MONO}>
        {d.sublabel ?? ''}
      </text>
      <DeviceLabel x={d.x} y={d.y + 100} text={d.label} />
    </g>
  );
}

// ---- трёхполюсный автомат ----
function Breaker3P({ d, powered }: { d: DeviceDef; powered: boolean }) {
  return (
    <g>
      <rect x={d.x - 78} y={d.y - 70} width={156} height={140} rx={7} fill="url(#moduleBody)" stroke="#7d8ba1" strokeWidth={2} />
      <rect x={d.x - 73} y={d.y - 65} width={146} height={10} rx={4} fill="#8b98ad" opacity={0.55} />
      {d.terminals.map((t) => (
        <rect key={t.key} x={d.x + t.dx - 13} y={d.y + t.dy - 8} width={26} height={16} rx={4} fill="#6d7a90" stroke="#4c586e" strokeWidth={1.4} />
      ))}
      {[-52, 0, 52].map((dx) => (
        <g key={dx}>
          <rect x={d.x + dx - 8} y={d.y - 26} width={16} height={44} rx={4} fill="#161e2c" />
          <rect x={d.x + dx - 6} y={powered ? d.y - 24 : d.y - 4} width={12} height={20} rx={3} fill="#0b0f16" style={{ transition: 'y .35s' }} />
        </g>
      ))}
      <rect x={d.x - 60} y={powered ? d.y - 16 : d.y + 4} width={120} height={6} rx={3} fill="#0b0f16" style={{ transition: 'y .35s' }} />
      <text x={d.x} y={d.y - 40} textAnchor="middle" fontSize={12.5} fontWeight={800} fill="#26314a" fontFamily={MONO}>
        3P
      </text>
      <text x={d.x} y={d.y + 46} textAnchor="middle" fontSize={9.5} fontWeight={600} fill="#57637a" fontFamily={MONO}>
        {d.sublabel ?? ''}
      </text>
      <DeviceLabel x={d.x} y={d.y + 100} text={d.label} />
    </g>
  );
}

export function DeviceBody({ d, powered, on = true }: { d: DeviceDef; powered: boolean; on?: boolean }) {
  switch (d.type) {
    case 'cable':
      return <Cable d={d} />;
    case 'hub':
      return <Hub d={d} />;
    case 'busN':
      return <Bus d={d} kind="N" />;
    case 'busPE':
      return <Bus d={d} kind="PE" />;
    case 'comb':
      return <Comb d={d} />;
    case 'switch':
      return <SwitchPlate d={d} powered={powered} on={on} glyph="s1" />;
    case 'switch2':
      return <SwitchPlate d={d} powered={powered} on={on} glyph="s2" />;
    case 'switchP':
      return <SwitchPlate d={d} powered={powered} on={on} glyph="p" />;
    case 'switchX':
      return <SwitchPlate d={d} powered={powered} on={on} glyph="x" />;
    case 'dimmer':
      return <SwitchPlate d={d} powered={powered} on={on} glyph="dim" />;
    case 'lamp':
      return <Lamp d={d} powered={powered} />;
    case 'lamp2':
      return <Lamp2 d={d} powered={powered} />;
    case 'lampS':
      return <LampS d={d} powered={powered} />;
    case 'socket':
      return <Socket d={d} powered={powered} />;
    case 'breaker':
    case 'breaker2p':
    case 'rcd':
    case 'dif':
    case 'vrn':
    case 'uzip':
      return <Module d={d} powered={powered} on={on} />;
    case 'meter':
      return <Meter d={d} powered={powered} />;
    case 'pir':
      return <Pir d={d} powered={powered} />;
    case 'thermostat':
      return <Thermostat d={d} powered={powered} />;
    case 'stove':
      return <Stove d={d} powered={powered} />;
    case 'washer':
      return <Washer d={d} powered={powered} />;
    case 'oven':
      return <Oven d={d} powered={powered} />;
    case 'ac':
      return <AC d={d} powered={powered} />;
    case 'boiler':
      return <Boiler d={d} powered={powered} />;
    case 'floorheat':
      return <FloorHeat d={d} powered={powered} />;
    case 'cross':
      return <Cross d={d} powered={powered} />;
    case 'contactor':
      return <Contactor d={d} powered={powered} />;
    case 'ev':
      return <EV d={d} powered={powered} />;
    case 'evbox':
      return <EVBox d={d} powered={powered} />;
    case 'breaker3p':
      return <Breaker3P d={d} powered={powered} />;
    default:
      return null;
  }
}
