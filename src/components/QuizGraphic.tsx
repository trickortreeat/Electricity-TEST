import type { Graphic } from '../quizBank';

const MONO = "'JetBrains Mono', monospace";

export default function QuizGraphic({ g }: { g: Graphic }) {
  const wrap = (children: React.ReactNode, vb = '0 0 320 150') => (
    <svg viewBox={vb} className="h-36 w-full">
      {children}
    </svg>
  );

  const moduleBody = (x: number, w: number, fill = '#d7e0ec') => (
    <>
      <rect x={x} y={25} width={w} height={100} rx={6} fill={fill} stroke="#7d8ba1" strokeWidth={2} />
      <rect x={x + 4} y={29} width={w - 8} height={8} rx={3} fill="#8b98ad" opacity={0.6} />
      <rect x={x + w / 2 - 13} y={12} width={26} height={14} rx={3} fill="#6d7a90" />
      <rect x={x + w / 2 - 13} y={124} width={26} height={14} rx={3} fill="#6d7a90" />
    </>
  );

  switch (g.kind) {
    case 'breaker':
      return wrap(
        <>
          {moduleBody(130, 60)}
          <rect x={152} y={55} width={16} height={44} rx={4} fill="#161e2c" />
          <rect x={154} y={57} width={12} height={20} rx={3} fill="#0b0f16" />
          <text x={160} y={112} textAnchor="middle" fontSize={14} fontWeight={800} fill="#26314a" fontFamily={MONO}>
            {g.label}
          </text>
          <text x={160} y={48} textAnchor="middle" fontSize={10} fill="#57637a" fontFamily={MONO}>
            1P
          </text>
        </>,
      );
    case 'rcd':
    case 'dif':
      return wrap(
        <>
          {moduleBody(105, 110, g.kind === 'dif' ? '#fde4cf' : '#fdeccf')}
          <circle cx={130} cy={58} r={13} fill="#fbbf24" stroke="#b45309" strokeWidth={2} />
          <text x={130} y={63} textAnchor="middle" fontSize={13} fontWeight={800} fill="#78350f" fontFamily={MONO}>
            T
          </text>
          <rect x={175} y={52} width={16} height={44} rx={4} fill="#161e2c" />
          <rect x={177} y={54} width={12} height={20} rx={3} fill="#0b0f16" />
          <text x={160} y={112} textAnchor="middle" fontSize={13} fontWeight={800} fill="#26314a" fontFamily={MONO}>
            {g.label} {g.sub}
          </text>
          <rect x={105} y={12} width={26} height={14} rx={3} fill="#6d7a90" />
          <rect x={189} y={12} width={26} height={14} rx={3} fill="#6d7a90" />
          <rect x={105} y={124} width={26} height={14} rx={3} fill="#6d7a90" />
          <rect x={189} y={124} width={26} height={14} rx={3} fill="#6d7a90" />
        </>,
      );
    case 'cable':
      return wrap(
        <>
          <rect x={40} y={55} width={240} height={44} rx={22} fill="#1c2839" stroke="#33465f" strokeWidth={2} />
          <circle cx={110} cy={77} r={13} fill="#c96f2e" />
          <circle cx={160} cy={77} r={13} fill="#3d8bff" />
          <circle cx={210} cy={77} r={13} fill="#35c759" />
          <text x={160} y={35} textAnchor="middle" fontSize={16} fontWeight={800} fill="#9db2d4" fontFamily={MONO}>
            {g.section}
          </text>
          <text x={160} y={125} textAnchor="middle" fontSize={13} fill="#64748f" fontFamily={MONO}>
            длительный ток ≈ {g.amps}
          </text>
        </>,
      );
    case 'wires':
      return wrap(
        <>
          {[
            ['#c96f2e', 'L · фаза', 40],
            ['#3d8bff', 'N · ноль', 75],
            ['#35c759', 'PE · земля', 110],
          ].map(([c, t, y]) => (
            <g key={t as string}>
              <rect x={40} y={(y as number) - 8} width={130} height={16} rx={8} fill={c as string} />
              <text x={185} y={(y as number) + 5} fontSize={13} fontWeight={700} fill="#9db2d4" fontFamily={MONO}>
                {t as string}
              </text>
            </g>
          ))}
        </>,
      );
    case 'ferrule':
      return wrap(
        <>
          <rect x={30} y={68} width={130} height={14} rx={7} fill="#c96f2e" />
          <rect x={160} y={64} width={60} height={22} rx={3} fill="#c3ccd9" stroke="#7b8798" strokeWidth={2} />
          <rect x={215} y={58} width={40} height={34} rx={6} fill="#1d4ed8" stroke="rgba(0,0,0,0.3)" strokeWidth={1.5} />
          <text x={160} y={125} textAnchor="middle" fontSize={13} fill="#64748f" fontFamily={MONO}>
            НШВИ: гильза + изолированный манжет
          </text>
          <text x={160} y={40} textAnchor="middle" fontSize={12} fill="#9db2d4" fontFamily={MONO}>
            обжим кримпером
          </text>
        </>,
      );
    case 'socket':
      return wrap(
        <>
          <rect x={110} y={20} width={100} height={100} rx={16} fill="#25334b" stroke="#3c4d6e" strokeWidth={2} />
          <circle cx={160} cy={70} r={34} fill="#0b111e" stroke="#33465f" strokeWidth={2} />
          <rect x={144} y={60} width={10} height={22} rx={4} fill="#060a12" />
          <rect x={166} y={60} width={10} height={22} rx={4} fill="#060a12" />
          <path d="M 148 40 Q 160 47 172 40" fill="none" stroke="#35c759" strokeWidth={3.5} strokeLinecap="round" />
          <path d="M 148 100 Q 160 93 172 100" fill="none" stroke="#35c759" strokeWidth={3.5} strokeLinecap="round" />
        </>,
      );
    case 'lamp':
      return wrap(
        <>
          <circle cx={160} cy={70} r={38} fill="#ffd75e" opacity={0.25} />
          <circle cx={160} cy={70} r={28} fill="#ffd75e" stroke="#e8930c" strokeWidth={2} />
          <rect x={150} y={30} width={20} height={14} rx={3} fill="#8b94a7" />
          <polyline points="148,82 154,64 160,78 166,64 172,82" fill="none" stroke="#7c2d12" strokeWidth={2.5} strokeLinecap="round" />
          {[0, 60, 120, 180, 240, 300].map((a) => {
            const rad = (a * Math.PI) / 180;
            return <line key={a} x1={160 + Math.cos(rad) * 38} y1={70 + Math.sin(rad) * 38} x2={160 + Math.cos(rad) * 48} y2={70 + Math.sin(rad) * 48} stroke="#ffd75e" strokeWidth={3} strokeLinecap="round" />;
          })}
        </>,
      );
    case 'vrn':
      return wrap(
        <>
          {moduleBody(115, 90, '#cfe4f5')}
          <rect x={135} y={45} width={50} height={26} rx={4} fill="#0b111e" />
          <text x={160} y={64} textAnchor="middle" fontSize={15} fontWeight={700} fill="#4ade80" fontFamily={MONO}>
            230
          </text>
          <text x={160} y={92} textAnchor="middle" fontSize={10} fill="#57637a" fontFamily={MONO}>
            170 – 250 В
          </text>
          <text x={160} y={112} textAnchor="middle" fontSize={12} fontWeight={800} fill="#26314a" fontFamily={MONO}>
            РЕЛЕ U
          </text>
        </>,
      );
    case 'uzip':
      return wrap(
        <>
          {moduleBody(115, 90, '#fdf3c4')}
          <polygon points="168,42 148,72 160,72 152,100 176,66 163,66" fill="#f59e0b" />
          <text x={160} y={115} textAnchor="middle" fontSize={12} fontWeight={800} fill="#26314a" fontFamily={MONO}>
            УЗИП II
          </text>
        </>,
      );
    case 'meter':
      return wrap(
        <>
          <rect x={95} y={20} width={130} height={110} rx={10} fill="#1b2436" stroke="#3c4d6e" strokeWidth={2} />
          <rect x={110} y={38} width={100} height={32} rx={5} fill="#0b111e" />
          <text x={160} y={61} textAnchor="middle" fontSize={17} fontWeight={700} fill="#9ff0b6" fontFamily={MONO} letterSpacing={2}>
            00138.7
          </text>
          <text x={160} y={92} textAnchor="middle" fontSize={11} fill="#64748f" fontFamily={MONO}>
            кВт·ч
          </text>
          <circle cx={125} cy={112} r={5} fill="#f87171" />
        </>,
      );
    case 'contactor':
      return wrap(
        <>
          {moduleBody(115, 90, '#e2d5f7')}
          <rect x={138} y={52} width={20} height={30} rx={3} fill="#57637a" />
          <rect x={165} y={52} width={18} height={24} rx={3} fill="#ffc42e" />
          <text x={160} y={112} textAnchor="middle" fontSize={12} fontWeight={800} fill="#26314a" fontFamily={MONO}>
            КМ · A1–A2
          </text>
        </>,
      );
    case 'comb':
      return wrap(
        <>
          <rect x={50} y={60} width={220} height={16} rx={6} fill="#d97706" stroke="#92400e" strokeWidth={2} />
          {[70, 120, 170, 220, 250].map((x) => (
            <rect key={x} x={x} y={44} width={12} height={24} rx={3} fill="#b45309" />
          ))}
          <text x={160} y={110} textAnchor="middle" fontSize={13} fill="#9db2d4" fontFamily={MONO}>
            гребёнка: раздача фазы в ряду
          </text>
        </>,
      );
    case 'cross':
      return wrap(
        <>
          <rect x={60} y={30} width={200} height={90} rx={8} fill="#d7e0ec" stroke="#7d8ba1" strokeWidth={2} />
          {['#c96f2e', '#1f2937', '#c05621', '#3d8bff'].map((c, i) => (
            <rect key={i} x={70} y={38 + i * 20} width={180} height={14} rx={4} fill={c} opacity={0.85} />
          ))}
          <text x={160} y={135} textAnchor="middle" fontSize={12} fill="#64748f" fontFamily={MONO}>
            кросс-модуль L1 L2 L3 N
          </text>
        </>,
      );
    case 'ev':
      return wrap(
        <>
          <rect x={125} y={20} width={70} height={110} rx={14} fill="#16202f" stroke="#3c4d6e" strokeWidth={2} />
          <rect x={137} y={34} width={46} height={26} rx={5} fill="#0b111e" />
          <text x={160} y={53} textAnchor="middle" fontSize={12} fontWeight={700} fill="#4ade80" fontFamily={MONO}>
            7.4kW
          </text>
          <circle cx={160} cy={90} r={20} fill="#0b111e" stroke="#4ade80" strokeWidth={2.5} />
          <polygon points="165,76 152,94 160,94 155,108 170,86 161,86" fill="#4ade80" />
        </>,
      );
    case 'chain':
      return wrap(
        <>
          {g.items.map((it, i) => {
            const x = 12 + i * 62;
            return (
              <g key={it}>
                <rect x={x} y={55} width={52} height={40} rx={8} fill="#111a2a" stroke="#33465f" strokeWidth={2} />
                <text x={x + 26} y={80} textAnchor="middle" fontSize={10} fontWeight={700} fill="#9db2d4" fontFamily={MONO}>
                  {it}
                </text>
                {i < g.items.length - 1 && <path d={`M ${x + 54} 75 l 6 0`} stroke="#ffc42e" strokeWidth={3} markerEnd="" />}
              </g>
            );
          })}
        </>,
      );
    case 'power':
      return wrap(
        <>
          <text x={160} y={70} textAnchor="middle" fontSize={40} fontWeight={800} fill="#ffc42e" fontFamily={MONO}>
            {g.watt} Вт
          </text>
          <text x={160} y={104} textAnchor="middle" fontSize={15} fill="#64748f" fontFamily={MONO}>
            I = P / U · U = 220 В
          </text>
        </>,
      );
    default:
      return null;
  }
}
