import type { FigKind } from '../theory';

const M = "'JetBrains Mono', monospace";
const T = (p: { x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; b?: boolean; children: React.ReactNode }) => (
  <text x={p.x} y={p.y} fontSize={p.s ?? 12} fill={p.c ?? '#9db2d4'} textAnchor={p.a ?? 'middle'} fontFamily={M} fontWeight={p.b ? 700 : 500}>
    {p.children}
  </text>
);

export default function TheoryFig({ kind }: { kind: FigKind }) {
  const box = (children: React.ReactNode, h = 220) => (
    <svg viewBox={`0 0 640 ${h}`} className="w-full" style={{ maxHeight: h + 40 }}>
      {children}
    </svg>
  );

  switch (kind) {
    case 'atom':
      return box(
        <>
          <rect x={60} y={80} width={520} height={60} rx={30} fill="#1a2536" stroke="#33465f" strokeWidth={2} />
          <T x={320} y={50} s={13} c="#64748f">медный проводник</T>
          {[110, 180, 250, 320, 390, 460, 530].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy={110} r={11} fill="#ffc42e" opacity={0.9}>
                <animate attributeName="cx" values={`${x};${x + 70}`} dur="2s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.9;0.9;0" dur="2s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
              </circle>
              <text x={x} y={115} fontSize={11} fill="#78350f" textAnchor="middle" fontFamily={M} fontWeight={700}>
                e
                <animate attributeName="x" values={`${x};${x + 70}`} dur="2s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;1;1;0" dur="2s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
              </text>
            </g>
          ))}
          <path d="M 60 175 L 570 175" stroke="#ffc42e" strokeWidth={2} strokeDasharray="6 6" />
          <path d="M 570 175 l -12 -6 v 12 z" fill="#ffc42e" />
          <T x={320} y={196} s={12} c="#ffc42e">направление тока</T>
        </>,
      );

    case 'ohm':
      return box(
        <>
          <polygon points="320,30 520,190 120,190" fill="none" stroke="#33465f" strokeWidth={2.5} />
          <line x1={175} y1={125} x2={465} y2={125} stroke="#33465f" strokeWidth={2.5} />
          <line x1={320} y1={125} x2={320} y2={190} stroke="#33465f" strokeWidth={2.5} />
          <T x={320} y={100} s={40} c="#ffc42e" b>U</T>
          <T x={245} y={172} s={34} c="#38bdf8" b>I</T>
          <T x={400} y={172} s={34} c="#4ade80" b>R</T>
          <T x={100} y={40} s={12} c="#64748f" a="start">U = I × R</T>
          <T x={100} y={60} s={12} c="#64748f" a="start">I = U / R</T>
          <T x={100} y={80} s={12} c="#64748f" a="start">R = U / I</T>
        </>,
      );

    case 'circuit':
      return box(
        <>
          <rect x={40} y={40} width={70} height={140} rx={8} fill="#141d2c" stroke="#33465f" strokeWidth={2} />
          <T x={75} y={116} s={11} c="#64748f">СЕТЬ</T>
          <path d="M 110 75 H 420" stroke="#c96f2e" strokeWidth={7} strokeLinecap="round" />
          <path d="M 110 150 H 420" stroke="#3d8bff" strokeWidth={7} strokeLinecap="round" />
          <T x={250} y={62} s={12} c="#c96f2e">фаза L · 220 В</T>
          <T x={250} y={175} s={12} c="#3d8bff">ноль N · обратный путь</T>
          <rect x={420} y={60} width={110} height={105} rx={10} fill="#1b2436" stroke="#3c4d6e" strokeWidth={2} />
          <circle cx={475} cy={112} r={26} fill="#ffd75e" opacity={0.9} />
          <T x={475} y={117} s={11} c="#78350f" b>ПРИБОР</T>
          <path d="M 420 75 h 0" />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={140} cy={75} r={4} fill="#fff" opacity={0.8}>
              <animate attributeName="cx" values="140;420" dur="1.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
            </circle>
          ))}
          <path d="M 555 100 v 60" stroke="#35c759" strokeWidth={7} strokeLinecap="round" strokeDasharray="12 8" />
          <T x={595} y={135} s={11} c="#35c759" a="middle">PE</T>
          <T x={555} y={185} s={10} c="#64748f">не в круге</T>
        </>,
      );

    case 'wires3':
      return box(
        <>
          {[
            ['#c96f2e', 'L · Фаза', 'коричневый · 220 В · опасен', 45],
            ['#3d8bff', 'N · Ноль', 'синий · обратный путь тока', 105],
            ['#35c759', 'PE · Земля', 'жёлто-зелёный · защита', 165],
          ].map(([c, n, d, y]) => (
            <g key={n as string}>
              <rect x={40} y={(y as number) - 14} width={180} height={28} rx={14} fill={c as string} />
              {(c as string) === '#35c759' && <rect x={40} y={(y as number) - 14} width={180} height={28} rx={14} fill="#ffd93d" opacity={0.85} style={{ clipPath: 'polygon(0 0,12% 0,4% 100%,0 100%)' }} />}
              <T x={240} y={(y as number) - 1} s={15} c="#e7eefc" a="start" b>
                {n as string}
              </T>
              <T x={240} y={(y as number) + 16} s={11.5} c="#64748f" a="start">
                {d as string}
              </T>
            </g>
          ))}
        </>,
      );

    case 'cable-cut':
      return box(
        <>
          <circle cx={200} cy={110} r={85} fill="#1c2839" stroke="#33465f" strokeWidth={2} />
          <circle cx={200} cy={110} r={72} fill="#0f1826" />
          <circle cx={200} cy={72} r={26} fill="#c96f2e" />
          <circle cx={168} cy={135} r={26} fill="#3d8bff" />
          <circle cx={232} cy={135} r={26} fill="#35c759" />
          <T x={200} y={215} s={12} c="#64748f">кабель ВВГнг-LS 3×2,5</T>
          <line x1={330} y1={72} x2={430} y2={72} stroke="#475569" strokeWidth={1.5} strokeDasharray="4 4" />
          <T x={440} y={77} s={12} c="#c96f2e" a="start">фаза</T>
          <line x1={330} y1={110} x2={430} y2={110} stroke="#475569" strokeWidth={1.5} strokeDasharray="4 4" />
          <T x={440} y={115} s={12} c="#3d8bff" a="start">ноль</T>
          <line x1={330} y1={148} x2={430} y2={148} stroke="#475569" strokeWidth={1.5} strokeDasharray="4 4" />
          <T x={440} y={153} s={12} c="#35c759" a="start">земля</T>
          <T x={530} y={40} s={11} c="#64748f" a="start">S = 0,785 × d²</T>
        </>,
      );

    case 'breaker-inside':
      return box(
        <>
          <rect x={210} y={20} width={220} height={180} rx={10} fill="#d7e0ec" stroke="#7d8ba1" strokeWidth={2} />
          <rect x={295} y={5} width={50} height={20} rx={4} fill="#6d7a90" />
          <rect x={295} y={195} width={50} height={20} rx={4} fill="#6d7a90" />
          <rect x={300} y={55} width={40} height={70} rx={6} fill="#161e2c" />
          <rect x={306} y={60} width={28} height={30} rx={4} fill="#0b0f16" />
          <path d="M 250 60 q 18 20 0 40 q -18 20 0 40" fill="none" stroke="#c2410c" strokeWidth={5} />
          <T x={250} y={155} s={10} c="#7c2d12" b>тепловой</T>
          <T x={250} y={168} s={10} c="#7c2d12">биметалл</T>
          <rect x={370} y={60} width={34} height={60} rx={5} fill="none" stroke="#1e40af" strokeWidth={4} />
          {[70, 82, 94, 106].map((y) => (
            <line key={y} x1={370} y1={y} x2={404} y2={y} stroke="#1e40af" strokeWidth={3} />
          ))}
          <T x={387} y={155} s={10} c="#1e3a8a" b>электро-</T>
          <T x={387} y={168} s={10} c="#1e3a8a">магнитный</T>
          <T x={320} y={45} s={12} c="#26314a" b>C16</T>
        </>,
      );

    case 'rcd-principle':
      return box(
        <>
          <ellipse cx={320} cy={105} rx={78} ry={62} fill="none" stroke="#8b98ad" strokeWidth={8} />
          <T x={320} y={110} s={11} c="#64748f">тор</T>
          <path d="M 60 78 H 580" stroke="#c96f2e" strokeWidth={7} strokeLinecap="round" />
          <path d="M 60 135 H 580" stroke="#3d8bff" strokeWidth={7} strokeLinecap="round" />
          <T x={110} y={62} s={11} c="#c96f2e" a="start">I → 10 A</T>
          <T x={110} y={160} s={11} c="#3d8bff" a="start">I ← 10 A</T>
          <T x={520} y={62} s={11} c="#c96f2e" a="end">баланс</T>
          <T x={470} y={192} s={12} c="#4ade80" a="middle">сумма = 0 → всё в порядке</T>
          <path d="M 430 135 q 30 45 60 55" stroke="#ef4444" strokeWidth={4} strokeDasharray="6 5" fill="none" />
          <T x={175} y={192} s={12} c="#ef4444">утечка → УЗО отключит</T>
        </>,
      );

    case 'tn-systems':
      return box(
        <>
          {[
            ['TN-C', 40, ['PEN', '', ''], '#f59e0b'],
            ['TN-S', 240, ['N', 'PE', ''], '#4ade80'],
            ['TN-C-S', 440, ['PEN→', 'N+PE', ''], '#38bdf8'],
          ].map(([n, x, , c]) => (
            <g key={n as string}>
              <rect x={x as number} y={30} width={160} height={150} rx={10} fill="rgba(96,128,180,0.06)" stroke={c as string} strokeWidth={2} />
              <T x={(x as number) + 80} y={55} s={14} c={c as string} b>
                {n as string}
              </T>
            </g>
          ))}
          <path d="M 60 90 H 180" stroke="#f59e0b" strokeWidth={6} />
          <T x={120} y={82} s={10} c="#f59e0b">PEN общий</T>
          <T x={120} y={130} s={10} c="#64748f">розетки без земли</T>
          <T x={120} y={150} s={10} c="#ef4444">устарело</T>

          <path d="M 260 85 H 380" stroke="#3d8bff" strokeWidth={5} />
          <path d="M 260 105 H 380" stroke="#35c759" strokeWidth={5} />
          <T x={320} y={135} s={10} c="#64748f">N и PE раздельно</T>
          <T x={320} y={155} s={10} c="#4ade80">самая безопасная</T>

          <path d="M 460 85 H 520" stroke="#f59e0b" strokeWidth={6} />
          <path d="M 520 85 H 580" stroke="#3d8bff" strokeWidth={5} />
          <path d="M 520 85 L 580 108" stroke="#35c759" strokeWidth={5} />
          <circle cx={520} cy={85} r={5} fill="#fff" />
          <T x={520} y={140} s={10} c="#64748f">разделение</T>
          <T x={520} y={158} s={10} c="#38bdf8">в щите здания</T>
        </>,
      );

    case 'switch-phase':
      return box(
        <>
          <path d="M 50 60 H 240" stroke="#c96f2e" strokeWidth={7} strokeLinecap="round" />
          <rect x={240} y={35} width={70} height={50} rx={8} fill="#25334b" stroke="#3c4d6e" strokeWidth={2} />
          <line x1={255} y1={72} x2={296} y2={48} stroke="#8fa3c8" strokeWidth={5} strokeLinecap="round" />
          <T x={275} y={105} s={11} c="#9db2d4">выключатель</T>
          <path d="M 310 60 H 470" stroke="#c96f2e" strokeWidth={7} strokeLinecap="round" />
          <circle cx={520} cy={95} r={34} fill="#ffd75e" opacity={0.85} />
          <path d="M 470 60 q 50 0 50 30" stroke="#c96f2e" strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M 50 160 H 490 q 40 0 40 -30" stroke="#3d8bff" strokeWidth={7} fill="none" strokeLinecap="round" />
          <T x={200} y={182} s={11} c="#3d8bff">ноль идёт напрямую, минуя выключатель</T>
          <T x={520} y={155} s={11} c="#64748f">лампа</T>
        </>,
      );

    case 'passthrough':
      return box(
        <>
          <path d="M 40 105 H 140" stroke="#c96f2e" strokeWidth={6} strokeLinecap="round" />
          <T x={80} y={92} s={10} c="#c96f2e">фаза</T>
          <rect x={140} y={70} width={70} height={70} rx={8} fill="#25334b" stroke="#3c4d6e" strokeWidth={2} />
          <circle cx={155} cy={105} r={5} fill="#8fa3c8" />
          <circle cx={195} cy={85} r={5} fill="#ffc42e" />
          <circle cx={195} cy={125} r={5} fill="#5c7196" />
          <line x1={155} y1={105} x2={195} y2={85} stroke="#8fa3c8" strokeWidth={4} />
          <T x={175} y={162} s={10} c="#9db2d4">проходной №1</T>
          <path d="M 210 85 H 400" stroke="#c96f2e" strokeWidth={5} />
          <path d="M 210 125 H 400" stroke="#a16207" strokeWidth={5} />
          <T x={305} y={72} s={10} c="#64748f">бегунок 1</T>
          <T x={305} y={148} s={10} c="#64748f">бегунок 2</T>
          <rect x={400} y={70} width={70} height={70} rx={8} fill="#25334b" stroke="#3c4d6e" strokeWidth={2} />
          <circle cx={455} cy={105} r={5} fill="#8fa3c8" />
          <circle cx={415} cy={85} r={5} fill="#ffc42e" />
          <circle cx={415} cy={125} r={5} fill="#5c7196" />
          <line x1={415} y1={85} x2={455} y2={105} stroke="#8fa3c8" strokeWidth={4} />
          <T x={435} y={162} s={10} c="#9db2d4">проходной №2</T>
          <path d="M 470 105 H 540" stroke="#c96f2e" strokeWidth={6} strokeLinecap="round" />
          <circle cx={575} cy={105} r={26} fill="#ffd75e" opacity={0.9} />
        </>,
      );

    case 'panel-tree':
      return box(
        <>
          {[
            ['ВВОД', 30, '#64748f'],
            ['СЧЁТЧИК', 120, '#4ade80'],
            ['РЕЛЕ U', 215, '#38bdf8'],
            ['УЗИП', 300, '#facc15'],
            ['УЗО-S', 380, '#fb923c'],
          ].map(([n, x, c]) => (
            <g key={n as string}>
              <rect x={x as number} y={35} width={78} height={44} rx={8} fill="#111a2a" stroke={c as string} strokeWidth={2} />
              <T x={(x as number) + 39} y={62} s={11} c={c as string} b>
                {n as string}
              </T>
            </g>
          ))}
          <path d="M 108 57 h 12 M 198 57 h 17 M 293 57 h 7 M 378 57 h 2" stroke="#ffc42e" strokeWidth={3} />
          <path d="M 458 57 H 520 V 95" stroke="#ffc42e" strokeWidth={3} fill="none" />
          <rect x={470} y={95} width={100} height={34} rx={7} fill="#111a2a" stroke="#c084fc" strokeWidth={2} />
          <T x={520} y={117} s={11} c="#c084fc" b>КРОСС-МОДУЛЬ</T>
          {[80, 220, 360].map((x, i) => (
            <g key={x}>
              <path d={`M 520 129 V 150 H ${x + 45} V 165`} stroke="#ffc42e" strokeWidth={2.5} fill="none" />
              <rect x={x} y={165} width={90} height={38} rx={7} fill="#111a2a" stroke="#38bdf8" strokeWidth={2} />
              <T x={x + 45} y={188} s={10} c="#38bdf8" b>
                {['УЗО СВЕТ', 'УЗО РОЗЕТКИ', 'АВДТ ВАННАЯ'][i]}
              </T>
            </g>
          ))}
        </>,
      );

    case 'selectivity':
      return box(
        <>
          <rect x={250} y={20} width={140} height={44} rx={8} fill="#111a2a" stroke="#fb923c" strokeWidth={2} />
          <T x={320} y={40} s={12} c="#fb923c" b>УЗО-S 100 мА</T>
          <T x={320} y={56} s={10} c="#64748f">задержка 0,15 с</T>
          <path d="M 320 64 V 95 H 150 V 120 M 320 95 H 490 V 120" stroke="#ffc42e" strokeWidth={2.5} fill="none" />
          {[80, 420].map((x, i) => (
            <g key={x}>
              <rect x={x} y={120} width={140} height={44} rx={8} fill="#111a2a" stroke={i === 0 ? '#ef4444' : '#38bdf8'} strokeWidth={2} />
              <T x={x + 70} y={140} s={12} c={i === 0 ? '#ef4444' : '#38bdf8'} b>
                УЗО 30 мА
              </T>
              <T x={x + 70} y={156} s={10} c="#64748f">
                {i === 0 ? 'сработало ✓' : 'в работе'}
              </T>
            </g>
          ))}
          <T x={150} y={195} s={11} c="#ef4444">авария здесь</T>
          <T x={490} y={195} s={11} c="#4ade80">свет не погас</T>
        </>,
      );

    case 'star-delta':
      return box(
        <>
          <T x={160} y={30} s={13} c="#4ade80" b>ЗВЕЗДА (Y)</T>
          <circle cx={160} cy={115} r={5} fill="#3d8bff" />
          {[[-70, -45], [70, -45], [0, 70]].map(([dx, dy], i) => (
            <g key={i}>
              <line x1={160} y1={115} x2={160 + dx} y2={115 + dy} stroke={['#c96f2e', '#1f2937', '#c05621'][i]} strokeWidth={5} />
              <circle cx={160 + dx} cy={115 + dy} r={7} fill={['#c96f2e', '#94a3b8', '#c05621'][i]} />
              <T x={160 + dx * 1.28} y={115 + dy * 1.28 + 4} s={11} c="#9db2d4">
                {['L1', 'L2', 'L3'][i]}
              </T>
            </g>
          ))}
          <T x={205} y={120} s={10} c="#3d8bff" a="start">N</T>
          <T x={160} y={205} s={11} c="#64748f">220 и 380 В</T>

          <T x={470} y={30} s={13} c="#f472b6" b>ТРЕУГОЛЬНИК (Δ)</T>
          <polygon points="470,60 540,165 400,165" fill="none" stroke="#c96f2e" strokeWidth={5} />
          {[[470, 60], [540, 165], [400, 165]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={7} fill="#c96f2e" />
              <T x={x} y={y - 14} s={11} c="#9db2d4">
                {['L1', 'L2', 'L3'][i]}
              </T>
            </g>
          ))}
          <T x={470} y={205} s={11} c="#64748f">только 380 В, без нуля</T>
        </>,
      );

    case 'ip-zones':
      return box(
        <>
          <rect x={40} y={40} width={560} height={150} rx={8} fill="rgba(96,128,180,0.05)" stroke="#33465f" strokeWidth={2} />
          <rect x={60} y={110} width={150} height={70} rx={10} fill="#1e3a5f" stroke="#3d8bff" strokeWidth={2} />
          <T x={135} y={152} s={12} c="#93c5fd">ВАННА</T>
          <rect x={60} y={60} width={150} height={50} rx={6} fill="rgba(239,68,68,0.12)" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 4" />
          <T x={135} y={88} s={11} c="#ef4444" b>ЗОНА 1 · только 12 В</T>
          <rect x={210} y={60} width={90} height={120} rx={6} fill="rgba(245,158,11,0.12)" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 4" />
          <T x={255} y={115} s={10} c="#f59e0b" b>ЗОНА 2</T>
          <T x={255} y={132} s={9} c="#f59e0b">60 см</T>
          <rect x={300} y={60} width={280} height={120} rx={6} fill="rgba(74,222,128,0.09)" stroke="#4ade80" strokeWidth={1.5} strokeDasharray="5 4" />
          <T x={440} y={110} s={11} c="#4ade80" b>ЗОНА 3 · розетки IP44</T>
          <T x={440} y={130} s={10} c="#4ade80">через УЗО 10–30 мА</T>
          <T x={135} y={205} s={10} c="#64748f">зона 0 — внутри ванны, только 12 В</T>
        </>,
      );

    case 'ferrule-crimp':
      return box(
        <>
          <rect x={40} y={95} width={200} height={22} rx={11} fill="#c96f2e" />
          <T x={140} y={80} s={11} c="#64748f">многопроволочная жила</T>
          <rect x={240} y={90} width={90} height={32} rx={4} fill="#c3ccd9" stroke="#7b8798" strokeWidth={2} />
          <rect x={330} y={82} width={70} height={48} rx={8} fill="#1d4ed8" />
          <rect x={340} y={92} width={8} height={28} rx={4} fill="rgba(255,255,255,0.3)" />
          <T x={285} y={152} s={11} c="#94a3b8">гильза</T>
          <T x={365} y={152} s={11} c="#60a5fa">манжет</T>
          <path d="M 440 70 v 25 M 440 145 v -25" stroke="#64748f" strokeWidth={3} />
          <polygon points="425,95 455,95 440,118" fill="#475569" />
          <polygon points="425,145 455,145 440,122" fill="#475569" />
          <T x={520} y={105} s={11} c="#9db2d4" a="start">кримпер</T>
          <T x={520} y={124} s={10} c="#64748f" a="start">квадратный обжим</T>
        </>,
      );

    case 'grounding':
      return box(
        <>
          <rect x={40} y={30} width={560} height={40} rx={6} fill="#1a2536" stroke="#33465f" strokeWidth={1.5} />
          <T x={320} y={55} s={12} c="#64748f">грунт</T>
          <line x1={40} y1={70} x2={600} y2={70} stroke="#4b5b74" strokeWidth={3} />
          {[180, 320, 460].map((x) => (
            <g key={x}>
              <rect x={x - 7} y={70} width={14} height={110} rx={3} fill="#8b98ad" stroke="#5b6577" strokeWidth={1.5} />
              <T x={x} y={200} s={10} c="#64748f">
                2–3 м
              </T>
            </g>
          ))}
          <path d="M 180 92 H 460" stroke="#35c759" strokeWidth={6} />
          <T x={320} y={82} s={11} c="#35c759">полоса 40×4 мм</T>
          <path d="M 320 92 V 40" stroke="#35c759" strokeWidth={6} />
          <T x={385} y={35} s={11} c="#35c759" a="start">к ГЗШ</T>
          <T x={100} y={150} s={11} c="#9db2d4" a="start">R ≤ 30 Ом</T>
          <T x={100} y={168} s={10} c="#64748f" a="start">треугольник 3×3 м</T>
        </>,
      );

    case 'power-triangle':
      return box(
        <>
          <polygon points="150,170 470,170 470,50" fill="none" stroke="#33465f" strokeWidth={2} />
          <line x1={150} y1={170} x2={470} y2={170} stroke="#4ade80" strokeWidth={6} />
          <line x1={470} y1={170} x2={470} y2={50} stroke="#38bdf8" strokeWidth={6} />
          <line x1={150} y1={170} x2={470} y2={50} stroke="#ffc42e" strokeWidth={6} />
          <T x={310} y={193} s={13} c="#4ade80" b>P — активная (Вт)</T>
          <T x={555} y={115} s={13} c="#38bdf8" b>Q (вар)</T>
          <T x={270} y={95} s={13} c="#ffc42e" b>S (ВА)</T>
          <path d="M 195 170 a 45 45 0 0 0 12 -18" fill="none" stroke="#94a3b8" strokeWidth={2} />
          <T x={220} y={155} s={12} c="#94a3b8">φ</T>
          <T x={150} y={35} s={11} c="#64748f" a="start">cos φ = P / S</T>
        </>,
      );

    case 'ev-charge':
      return box(
        <>
          <rect x={60} y={40} width={110} height={150} rx={12} fill="#16202f" stroke="#3c4d6e" strokeWidth={2} />
          <rect x={78} y={60} width={74} height={38} rx={6} fill="#0b111e" />
          <T x={115} y={85} s={14} c="#4ade80" b>7.4 kW</T>
          <circle cx={115} cy={135} r={24} fill="#0b111e" stroke="#4ade80" strokeWidth={2.5} />
          <polygon points="121,118 106,142 116,142 110,160 128,132 117,132" fill="#4ade80" />
          <T x={115} y={207} s={11} c="#64748f">Wallbox</T>
          <path d="M 170 150 q 90 40 170 10" stroke="#0a0f18" strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d="M 170 150 q 90 40 170 10" stroke="#4ade80" strokeWidth={7} fill="none" strokeLinecap="round" />
          <rect x={340} y={130} width={230} height={70} rx={20} fill="#1b2436" stroke="#3c4d6e" strokeWidth={2} />
          <circle cx={395} cy={205} r={18} fill="#0f172a" stroke="#475569" strokeWidth={3} />
          <circle cx={520} cy={205} r={18} fill="#0f172a" stroke="#475569" strokeWidth={3} />
          <T x={455} y={172} s={12} c="#9db2d4">электромобиль</T>
          <T x={350} y={60} s={11} c="#f59e0b" a="start">кабель 3×6 мм² · C40 · УЗО тип A</T>
          <T x={350} y={80} s={11} c="#64748f" a="start">32 А непрерывно 6–10 часов</T>
        </>,
      );

    case 'sine':
      return box(
        <>
          <line x1={40} y1={110} x2={600} y2={110} stroke="#33465f" strokeWidth={1.5} />
          <line x1={60} y1={25} x2={60} y2={195} stroke="#33465f" strokeWidth={1.5} />
          <path
            d={`M 60 110 ${Array.from({ length: 108 }, (_, i) => {
              const x = 60 + i * 5;
              const y = 110 - Math.sin((i / 27) * Math.PI) * 68;
              return `L ${x} ${y}`;
            }).join(' ')}`}
            fill="none"
            stroke="#ffc42e"
            strokeWidth={3.5}
          />
          <T x={330} y={215} s={11} c="#64748f">один период = 20 мс · 50 периодов в секунду</T>
          <line x1={60} y1={42} x2={600} y2={42} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 5" />
          <T x={630} y={46} s={10} c="#ef4444" a="end">325 В</T>
          <line x1={60} y1={62} x2={600} y2={62} stroke="#4ade80" strokeWidth={1.5} strokeDasharray="5 5" />
          <T x={630} y={78} s={10} c="#4ade80" a="end">230 В</T>
        </>,
      );
    case 'series-parallel':
      return box(
        <>
          <T x={160} y={28} s={12} c="#9db2d4" b>ПОСЛЕДОВАТЕЛЬНО</T>
          <path d="M 50 90 H 100 M 140 90 H 190 M 230 90 H 280" stroke="#c96f2e" strokeWidth={4} />
          {[100, 190].map((x) => (
            <rect key={x} x={x} y={76} width={40} height={28} rx={5} fill="#1b2436" stroke="#7d8ba1" strokeWidth={2} />
          ))}
          <T x={165} y={130} s={10} c="#64748f">одна перегорит — гаснут все</T>

          <T x={470} y={28} s={12} c="#9db2d4" b>ПАРАЛЛЕЛЬНО</T>
          <path d="M 380 60 H 570 M 380 140 H 570" stroke="#c96f2e" strokeWidth={4} />
          {[410, 470, 530].map((x) => (
            <g key={x}>
              <line x1={x} y1={60} x2={x} y2={86} stroke="#c96f2e" strokeWidth={3} />
              <rect x={x - 18} y={86} width={36} height={28} rx={5} fill="#1b2436" stroke="#7d8ba1" strokeWidth={2} />
              <line x1={x} y1={114} x2={x} y2={140} stroke="#3d8bff" strokeWidth={3} />
            </g>
          ))}
          <T x={470} y={168} s={10} c="#4ade80">каждый работает независимо</T>
        </>,
      );
    case 'magnet':
      return box(
        <>
          <rect x={280} y={40} width={22} height={140} rx={6} fill="#c96f2e" />
          {[70, 110, 150].map((y) => (
            <g key={y}>
              <ellipse cx={291} cy={y} rx={72} ry={26} fill="none" stroke="#38bdf8" strokeWidth={2} strokeDasharray="6 4" />
            </g>
          ))}
          <T x={291} y={210} s={11} c="#38bdf8">магнитные линии вокруг проводника</T>
          <T x={291} y={28} s={11} c="#c96f2e">ток I</T>
          <path d="M 480 60 v 100" stroke="#8b98ad" strokeWidth={3} />
          {[70, 90, 110, 130, 150].map((y) => (
            <ellipse key={y} cx={480} cy={y} rx={26} ry={9} fill="none" stroke="#ffc42e" strokeWidth={3} />
          ))}
          <T x={480} y={190} s={11} c="#ffc42e">катушка усиливает поле</T>
        </>,
      );
    case 'transformer':
      return box(
        <>
          <rect x={280} y={35} width={80} height={150} rx={4} fill="none" stroke="#8b98ad" strokeWidth={9} />
          {[60, 85, 110, 135, 160].map((y) => (
            <ellipse key={`a${y}`} cx={280} cy={y} rx={30} ry={10} fill="none" stroke="#c96f2e" strokeWidth={4} />
          ))}
          {[70, 100, 130].map((y) => (
            <ellipse key={`b${y}`} cx={360} cy={y} rx={30} ry={11} fill="none" stroke="#3d8bff" strokeWidth={4} />
          ))}
          <T x={180} y={110} s={12} c="#c96f2e">W₁ = 500</T>
          <T x={180} y={130} s={11} c="#64748f">230 В</T>
          <T x={470} y={110} s={12} c="#3d8bff">W₂ = 25</T>
          <T x={470} y={130} s={11} c="#64748f">12 В</T>
          <T x={320} y={210} s={11} c="#9db2d4">U₁/U₂ = W₁/W₂</T>
        </>,
      );
    case 'motor':
      return box(
        <>
          <circle cx={320} cy={110} r={80} fill="#1b2436" stroke="#7d8ba1" strokeWidth={3} />
          <circle cx={320} cy={110} r={44} fill="#2b3648" stroke="#57637a" strokeWidth={2} />
          <circle cx={320} cy={110} r={12} fill="#8b98ad" />
          {[0, 60, 120, 180, 240, 300].map((a) => {
            const r = (a * Math.PI) / 180;
            return <rect key={a} x={320 + Math.cos(r) * 60 - 7} y={110 + Math.sin(r) * 60 - 7} width={14} height={14} rx={3} fill="#c96f2e" />;
          })}
          <T x={320} y={215} s={11} c="#64748f">статор с обмотками и короткозамкнутый ротор</T>
          <path d="M 400 110 h 60" stroke="#8b98ad" strokeWidth={8} />
          <T x={130} y={60} s={11} c="#c96f2e" a="start">L1 L2 L3</T>
        </>,
      );
    case 'symbols':
      return box(
        <>
          {[
            ['QF', 60], ['УЗО', 160], ['КМ', 260], ['SB', 360], ['EL', 460], ['XS', 560],
          ].map(([n, x], i) => (
            <g key={n as string}>
              <rect x={(x as number) - 38} y={55} width={76} height={70} rx={8} fill="#111a2a" stroke="#33465f" strokeWidth={2} />
              <T x={x as number} y={88} s={13} c="#ffc42e" b>{n as string}</T>
              <T x={x as number} y={110} s={9} c="#64748f">
                {['автомат', 'УЗО', 'контактор', 'кнопка', 'светильник', 'розетка'][i]}
              </T>
            </g>
          ))}
          <T x={320} y={165} s={11} c="#9db2d4">буквенно-цифровые обозначения по ГОСТ 2.710</T>
        </>,
      );
    case 'multimeter':
      return box(
        <>
          <rect x={230} y={25} width={180} height={170} rx={14} fill="#1b2436" stroke="#f59e0b" strokeWidth={3} />
          <rect x={250} y={42} width={140} height={44} rx={6} fill="#0b111e" />
          <T x={320} y={74} s={22} c="#4ade80" b>230.4</T>
          <circle cx={320} cy={135} r={34} fill="#0f172a" stroke="#57637a" strokeWidth={2} />
          <line x1={320} y1={135} x2={300} y2={112} stroke="#f59e0b" strokeWidth={4} strokeLinecap="round" />
          <T x={278} y={104} s={9} c="#64748f">V~</T>
          <T x={362} y={104} s={9} c="#64748f">V=</T>
          <T x={278} y={172} s={9} c="#64748f">Ω</T>
          <T x={362} y={172} s={9} c="#64748f">A</T>
          <circle cx={290} cy={185} r={7} fill="#0f172a" stroke="#111827" strokeWidth={2} />
          <circle cx={350} cy={185} r={7} fill="#7f1d1d" stroke="#450a0a" strokeWidth={2} />
          <T x={130} y={110} s={11} c="#9db2d4" a="start">чёрный — COM</T>
          <T x={470} y={110} s={11} c="#f87171" a="start">красный — VΩmA</T>
        </>,
      );
    case 'shock':
      return box(
        <>
          {[
            ['1 мА', 'ощутимый порог', '#4ade80', 60],
            ['10 мА', 'неотпускающий', '#facc15', 100],
            ['50 мА', 'паралич дыхания', '#fb923c', 140],
            ['100 мА', 'фибрилляция', '#ef4444', 180],
          ].map(([v, d, c, y]) => (
            <g key={v as string}>
              <rect x={60} y={(y as number) - 13} width={(Number(String(v).split(' ')[0]) / 100) * 380 + 60} height={26} rx={13} fill={c as string} opacity={0.85} />
              <T x={70} y={(y as number) + 5} s={12} c="#0b1220" a="start" b>{v as string}</T>
              <T x={470} y={(y as number) + 5} s={11.5} c={c as string} a="start">{d as string}</T>
            </g>
          ))}
          <line x1={173} y1={40} x2={173} y2={200} stroke="#fff" strokeWidth={2} strokeDasharray="5 4" />
          <T x={173} y={30} s={10} c="#fff">порог УЗО 30 мА</T>
        </>,
      );
    case 'lamp-types':
      return box(
        <>
          {[
            ['15', 'накал', '#f59e0b', 100],
            ['25', 'галоген', '#fbbf24', 210],
            ['70', 'люминес.', '#a3e635', 320],
            ['140', 'светодиод', '#4ade80', 430],
          ].map(([v, n, c, x]) => (
            <g key={n as string}>
              <rect x={(x as number) - 32} y={190 - Number(v)} width={64} height={Number(v)} rx={5} fill={c as string} opacity={0.85} />
              <T x={x as number} y={185 - Number(v)} s={12} c={c as string} b>{v as string} лм/Вт</T>
              <T x={x as number} y={208} s={11} c="#9db2d4">{n as string}</T>
            </g>
          ))}
          <line x1={50} y1={190} x2={590} y2={190} stroke="#33465f" strokeWidth={2} />
        </>,
      );
    case 'socket-types':
      return box(
        <>
          {[160, 320, 480].map((x, i) => (
            <g key={x}>
              <rect x={x - 55} y={40} width={110} height={110} rx={16} fill="#25334b" stroke="#3c4d6e" strokeWidth={2} />
              <circle cx={x} cy={95} r={36} fill="#0b111e" stroke="#33465f" strokeWidth={2} />
              <rect x={x - 18} y={84} width={11} height={24} rx={4} fill="#060a12" />
              <rect x={x + 7} y={84} width={11} height={24} rx={4} fill="#060a12" />
              {i > 0 && (
                <>
                  <path d={`M ${x - 13} 63 Q ${x} 70 ${x + 13} 63`} fill="none" stroke="#35c759" strokeWidth={3.5} strokeLinecap="round" />
                  <path d={`M ${x - 13} 127 Q ${x} 120 ${x + 13} 127`} fill="none" stroke="#35c759" strokeWidth={3.5} strokeLinecap="round" />
                </>
              )}
              <T x={x} y={175} s={11} c="#9db2d4">{['Тип C · без земли', 'Тип F · Schuko 16 А', 'IP44 · влагозащита'][i]}</T>
            </g>
          ))}
        </>,
      );
    case 'box-wire':
      return box(
        <>
          <circle cx={320} cy={108} r={90} fill="rgba(96,128,180,0.06)" stroke="#33465f" strokeWidth={2} strokeDasharray="8 6" />
          {[
            ['#c96f2e', 70],
            ['#3d8bff', 108],
            ['#35c759', 146],
          ].map(([c, y]) => (
            <g key={y as number}>
              <rect x={262} y={(y as number) - 10} width={116} height={20} rx={10} fill="rgba(245,158,11,0.14)" stroke="rgba(245,158,11,0.6)" strokeWidth={1.5} />
              <path d={`M 180 ${y} H 262`} stroke={c as string} strokeWidth={6} strokeLinecap="round" />
              <path d={`M 378 ${y} H 460`} stroke={c as string} strokeWidth={6} strokeLinecap="round" />
            </g>
          ))}
          <T x={320} y={222} s={11} c="#64748f">все фазы в один клеммник, нули — в другой, земли — в третий</T>
        </>,
      );
    case 'trace-rules':
      return box(
        <>
          <rect x={50} y={25} width={540} height={170} rx={6} fill="rgba(96,128,180,0.05)" stroke="#33465f" strokeWidth={2} />
          <line x1={50} y1={55} x2={590} y2={55} stroke="#4ade80" strokeWidth={5} />
          <T x={320} y={45} s={10} c="#4ade80">горизонталь: 15 см от потолка ✓</T>
          <line x1={180} y1={55} x2={180} y2={150} stroke="#4ade80" strokeWidth={5} />
          <rect x={160} y={150} width={40} height={26} rx={4} fill="#25334b" stroke="#3c4d6e" strokeWidth={2} />
          <T x={180} y={192} s={10} c="#4ade80">вертикальный спуск ✓</T>
          <line x1={330} y1={70} x2={480} y2={160} stroke="#ef4444" strokeWidth={5} />
          <T x={420} y={185} s={10} c="#ef4444">диагональ запрещена ✗</T>
          <rect x={500} y={100} width={70} height={70} rx={5} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 4" />
          <T x={535} y={140} s={9} c="#f59e0b">окно</T>
        </>,
      );
    case 'din-rail':
      return box(
        <>
          <rect x={50} y={95} width={540} height={22} rx={5} fill="#4b5b74" stroke="#2c3a55" strokeWidth={2} />
          <rect x={44} y={80} width={12} height={52} rx={3} fill="#8b98ad" stroke="#5b6577" strokeWidth={1.5} />
          <rect x={584} y={80} width={12} height={52} rx={3} fill="#8b98ad" stroke="#5b6577" strokeWidth={1.5} />
          {[80, 130, 180, 240, 320, 400].map((x, i) => {
            const w = [44, 44, 52, 72, 72, 44][i];
            return (
              <g key={x}>
                <rect x={x} y={50} width={w} height={112} rx={6} fill="#d7e0ec" stroke="#7d8ba1" strokeWidth={2} />
                <rect x={x + 4} y={54} width={w - 8} height={14} rx={3} fill="#fff" stroke="#94a3b8" strokeWidth={1} />
                <text x={x + w / 2} y={65} textAnchor="middle" fontSize={9} fontWeight={800} fill="#0f172a" fontFamily={M}>
                  {['C16', 'C16', 'C25', 'УЗО', 'АВДТ', 'C10'][i]}
                </text>
                <rect x={x + w / 2 - 6} y={95} width={12} height={22} rx={3} fill="#0b0f16" />
              </g>
            );
          })}
          <T x={320} y={200} s={11} c="#64748f">1 модуль = 17,5 мм · заглушки закрывают пустые места</T>
        </>,
      );
    case 'busbar-comb':
      return box(
        <>
          <rect x={60} y={60} width={230} height={14} rx={6} fill="#d97706" stroke="#92400e" strokeWidth={1.5} />
          {[80, 130, 180, 230, 265].map((x) => (
            <rect key={x} x={x} y={46} width={11} height={22} rx={3} fill="#b45309" />
          ))}
          <T x={175} y={100} s={11} c="#f59e0b">гребёнка — внутри ряда</T>
          <rect x={60} y={140} width={230} height={26} rx={8} fill="rgba(61,139,255,0.12)" stroke="rgba(61,139,255,0.6)" strokeWidth={1.5} />
          <T x={175} y={190} s={11} c="#3d8bff">шина N — своя на каждое УЗО</T>
          <rect x={350} y={45} width={230} height={130} rx={8} fill="#d7e0ec" stroke="#7d8ba1" strokeWidth={2} />
          {['#c96f2e', '#1f2937', '#c05621', '#3d8bff'].map((c, i) => (
            <rect key={i} x={360} y={55 + i * 30} width={210} height={20} rx={5} fill={c} opacity={0.85} />
          ))}
          <T x={465} y={200} s={11} c="#9db2d4">кросс-модуль — между рядами</T>
        </>,
      );
    case 'meter-scheme':
      return box(
        <>
          <rect x={200} y={30} width={240} height={140} rx={10} fill="#1b2436" stroke="#3c4d6e" strokeWidth={2} />
          <rect x={230} y={50} width={180} height={40} rx={5} fill="#0b111e" />
          <T x={320} y={80} s={20} c="#9ff0b6" b>00138.7</T>
          <T x={320} y={112} s={11} c="#64748f">кВт·ч</T>
          {[240, 290, 350, 400].map((x, i) => (
            <g key={x}>
              <rect x={x - 12} y={168} width={24} height={16} rx={3} fill="#6d7a90" />
              <T x={x} y={200} s={12} c="#9db2d4" b>{String(i + 1)}</T>
              <T x={x} y={216} s={9} c="#64748f">{['L вх', 'L вых', 'N вх', 'N вых'][i]}</T>
            </g>
          ))}
        </>,
      );
    case 'lightning':
      return box(
        <>
          <polygon points="120,20 80,105 108,105 70,190 160,90 122,90" fill="#facc15" />
          <path d="M 200 60 H 420" stroke="#c96f2e" strokeWidth={6} />
          <rect x={420} y={35} width={80} height={100} rx={7} fill="#fdf3c4" stroke="#a16207" strokeWidth={2} />
          <T x={460} y={90} s={12} c="#78350f" b>УЗИП</T>
          <path d="M 460 135 V 180 H 560" stroke="#35c759" strokeWidth={6} />
          <path d="M 540 180 h 40 M 548 190 h 24 M 556 200 h 8" stroke="#35c759" strokeWidth={3} />
          <T x={300} y={45} s={11} c="#f59e0b">импульс до 6000 В</T>
          <T x={340} y={205} s={11} c="#4ade80">энергия уходит в землю</T>
        </>,
      );
    case 'solar':
      return box(
        <>
          <g transform="translate(50 40) rotate(-12)">
            <rect x={0} y={0} width={150} height={95} rx={5} fill="#1e3a5f" stroke="#3d8bff" strokeWidth={2} />
            {[1, 2, 3].map((i) => (
              <line key={i} x1={0} y1={i * 24} x2={150} y2={i * 24} stroke="#3d8bff" strokeWidth={1.5} opacity={0.6} />
            ))}
            {[1, 2].map((i) => (
              <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={95} stroke="#3d8bff" strokeWidth={1.5} opacity={0.6} />
            ))}
          </g>
          <T x={125} y={175} s={11} c="#3d8bff">панели · DC до 600 В</T>
          <path d="M 220 95 H 280" stroke="#ef4444" strokeWidth={5} />
          <rect x={280} y={55} width={90} height={90} rx={8} fill="#1b2436" stroke="#7d8ba1" strokeWidth={2} />
          <T x={325} y={95} s={12} c="#9db2d4" b>ИНВЕРТОР</T>
          <T x={325} y={115} s={9} c="#64748f">DC → AC</T>
          <path d="M 370 95 H 430" stroke="#c96f2e" strokeWidth={5} />
          <rect x={430} y={60} width={80} height={80} rx={8} fill="#111a2a" stroke="#4ade80" strokeWidth={2} />
          <T x={470} y={105} s={11} c="#4ade80" b>ЩИТ</T>
          <T x={470} y={170} s={11} c="#64748f">230 В AC</T>
        </>,
      );
    case 'ups':
    case 'gen-switch':
      return box(
        <>
          <rect x={40} y={70} width={110} height={70} rx={8} fill="#111a2a" stroke="#4ade80" strokeWidth={2} />
          <T x={95} y={110} s={12} c="#4ade80" b>СЕТЬ</T>
          <rect x={40} y={160} width={110} height={60} rx={8} fill="#111a2a" stroke="#f59e0b" strokeWidth={2} />
          <T x={95} y={195} s={12} c="#f59e0b" b>ГЕНЕРАТОР</T>
          <rect x={250} y={80} width={130} height={110} rx={10} fill="#1b2436" stroke="#7d8ba1" strokeWidth={2} />
          <T x={315} y={110} s={12} c="#9db2d4" b>I — 0 — II</T>
          <circle cx={315} cy={145} r={22} fill="#0f172a" stroke="#57637a" strokeWidth={2} />
          <line x1={315} y1={145} x2={296} y2={128} stroke="#4ade80" strokeWidth={4} strokeLinecap="round" />
          <T x={315} y={210} s={10} c="#64748f">механическая блокировка</T>
          <path d="M 150 105 H 250 M 150 190 Q 200 190 250 160" stroke="#8b98ad" strokeWidth={4} fill="none" />
          <path d="M 380 135 H 480" stroke="#c96f2e" strokeWidth={5} />
          <rect x={480} y={95} width={100} height={80} rx={8} fill="#111a2a" stroke="#38bdf8" strokeWidth={2} />
          <T x={530} y={140} s={12} c="#38bdf8" b>НАГРУЗКА</T>
        </>,
      );
    case 'heat':
      return box(
        <>
          <rect x={80} y={70} width={480} height={70} rx={35} fill="none" stroke="#33465f" strokeWidth={2} />
          {[
            ['#4ade80', 120, '40°C'],
            ['#facc15', 250, '60°C'],
            ['#fb923c', 380, '75°C'],
            ['#ef4444', 500, '90°C'],
          ].map(([c, x, t]) => (
            <g key={x as number}>
              <circle cx={x as number} cy={105} r={30} fill={c as string} opacity={0.75} />
              <T x={x as number} y={110} s={12} c="#0b1220" b>{t as string}</T>
            </g>
          ))}
          <T x={320} y={175} s={11} c="#64748f">рост нагрузки → рост температуры → сокращение ресурса изоляции</T>
          <T x={320} y={40} s={11} c="#ef4444">каждые +10 °C сокращают срок службы вдвое</T>
        </>,
      );
    case 'insulation-test':
      return box(
        <>
          <rect x={60} y={60} width={140} height={110} rx={10} fill="#1b2436" stroke="#c084fc" strokeWidth={2} />
          <T x={130} y={100} s={13} c="#c084fc" b>МЕГОММЕТР</T>
          <rect x={80} y={115} width={100} height={34} rx={5} fill="#0b111e" />
          <T x={130} y={140} s={16} c="#4ade80" b>&gt;100 МΩ</T>
          <path d="M 200 90 H 420" stroke="#c96f2e" strokeWidth={5} />
          <path d="M 200 140 H 420" stroke="#35c759" strokeWidth={5} />
          <T x={310} y={78} s={10} c="#c96f2e">жила</T>
          <T x={310} y={165} s={10} c="#35c759">земля / броня</T>
          <rect x={420} y={60} width={140} height={110} rx={8} fill="rgba(96,128,180,0.06)" stroke="#33465f" strokeWidth={2} strokeDasharray="7 5" />
          <T x={490} y={118} s={11} c="#64748f">кабель</T>
          <T x={320} y={205} s={11} c="#f59e0b">норма для жилых зданий — не менее 0,5 МОм</T>
        </>,
      );
    case 'kz-loop':
      return box(
        <>
          <rect x={40} y={80} width={80} height={70} rx={8} fill="#111a2a" stroke="#33465f" strokeWidth={2} />
          <T x={80} y={120} s={11} c="#9db2d4">ТП</T>
          <path d="M 120 100 H 520" stroke="#c96f2e" strokeWidth={5} />
          <path d="M 120 135 H 520" stroke="#3d8bff" strokeWidth={5} />
          <rect x={250} y={78} width={44} height={44} rx={6} fill="#d7e0ec" stroke="#7d8ba1" strokeWidth={2} />
          <T x={272} y={105} s={10} c="#26314a" b>QF</T>
          <path d="M 520 100 V 135" stroke="#ef4444" strokeWidth={6} />
          <polygon points="530,105 512,128 524,128 516,146 538,118 526,118" fill="#facc15" />
          <T x={520} y={175} s={11} c="#ef4444">точка КЗ</T>
          <T x={320} y={200} s={11} c="#9db2d4">I_кз = U / Z_петли · для C16 нужно ≥ 160 А</T>
        </>,
      );
    case 'harmonics':
      return box(
        <>
          <line x1={50} y1={110} x2={600} y2={110} stroke="#33465f" strokeWidth={1.5} />
          <path
            d={`M 60 110 ${Array.from({ length: 105 }, (_, i) => {
              const x = 60 + i * 5;
              const y = 110 - Math.sin((i / 26) * Math.PI) * 55;
              return `L ${x} ${y}`;
            }).join(' ')}`}
            fill="none"
            stroke="#4ade80"
            strokeWidth={2.5}
            opacity={0.6}
          />
          <path
            d={`M 60 110 ${Array.from({ length: 105 }, (_, i) => {
              const x = 60 + i * 5;
              const b = Math.sin((i / 26) * Math.PI);
              const y = 110 - (Math.abs(b) > 0.75 ? Math.sign(b) * 78 : b * 12);
              return `L ${x} ${y}`;
            }).join(' ')}`}
            fill="none"
            stroke="#ef4444"
            strokeWidth={3}
          />
          <T x={330} y={205} s={11} c="#ef4444">импульсный БП потребляет ток пиками — это гармоники</T>
          <T x={130} y={38} s={10} c="#4ade80" a="start">идеальная синусоида</T>
        </>,
      );
    case 'compensation':
      return box(
        <>
          <polygon points="150,160 420,160 420,60" fill="none" stroke="#33465f" strokeWidth={2} />
          <line x1={150} y1={160} x2={420} y2={160} stroke="#4ade80" strokeWidth={6} />
          <line x1={420} y1={160} x2={420} y2={60} stroke="#ef4444" strokeWidth={6} />
          <line x1={150} y1={160} x2={420} y2={60} stroke="#ffc42e" strokeWidth={6} />
          <T x={285} y={183} s={12} c="#4ade80" b>P — полезная</T>
          <T x={500} y={110} s={12} c="#ef4444" b>Q — реактивная</T>
          <T x={250} y={100} s={12} c="#ffc42e" b>S — полная</T>
          <rect x={430} y={110} width={60} height={40} rx={5} fill="#111a2a" stroke="#38bdf8" strokeWidth={2} />
          <T x={460} y={135} s={10} c="#38bdf8">C</T>
          <T x={320} y={210} s={11} c="#64748f">конденсатор компенсирует Q и уменьшает S</T>
        </>,
      );
    case 'contactor-scheme':
      return box(
        <>
          <rect x={230} y={40} width={130} height={140} rx={10} fill="#d7e0ec" stroke="#7d8ba1" strokeWidth={2} />
          <T x={295} y={68} s={13} c="#26314a" b>KM</T>
          <rect x={252} y={85} width={30} height={44} rx={4} fill="#57637a" />
          <rect x={300} y={85} width={28} height={38} rx={4} fill="#ffc42e" />
          <T x={295} y={152} s={10} c="#3c475c">A1 – A2 катушка</T>
          <path d="M 60 60 H 230" stroke="#c96f2e" strokeWidth={6} />
          <path d="M 360 60 H 560" stroke="#c96f2e" strokeWidth={6} />
          <T x={145} y={48} s={10} c="#c96f2e">силовой вход</T>
          <T x={460} y={48} s={10} c="#c96f2e">к нагрузке</T>
          <path d="M 60 200 H 180 M 240 200 H 295 V 180" stroke="#facc15" strokeWidth={4} fill="none" />
          <rect x={180} y={186} width={60} height={28} rx={5} fill="#25334b" stroke="#3c4d6e" strokeWidth={2} />
          <T x={210} y={205} s={10} c="#9db2d4">SB</T>
          <T x={110} y={188} s={10} c="#facc15">6 А управление</T>
        </>,
      );
    case 'timer-scheme':
    case 'floor-heat':
      return box(
        <>
          <rect x={60} y={140} width={520} height={60} rx={8} fill="rgba(96,128,180,0.06)" stroke="#33465f" strokeWidth={2} />
          <path d="M 90 190 h 460 v -18 h -460 v -18 h 460" fill="none" stroke="#f97316" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          <T x={320} y={222} s={11} c="#f97316">нагревательный мат 150 Вт/м²</T>
          <rect x={250} y={30} width={140} height={80} rx={10} fill="#25334b" stroke="#3c4d6e" strokeWidth={2} />
          <rect x={272} y={45} width={96} height={30} rx={5} fill="#0b111e" />
          <T x={320} y={68} s={15} c="#ffb254" b>26.5°</T>
          <T x={320} y={98} s={10} c="#64748f">терморегулятор</T>
          <path d="M 290 110 V 140 M 350 110 V 140" stroke="#c96f2e" strokeWidth={4} />
        </>,
      );
    case 'vent-scheme':
      return box(
        <>
          <rect x={60} y={60} width={130} height={100} rx={10} fill="#111a2a" stroke="#33465f" strokeWidth={2} />
          <T x={125} y={115} s={12} c="#9db2d4">ЩИТ</T>
          <path d="M 190 90 H 320" stroke="#c96f2e" strokeWidth={5} />
          <rect x={320} y={55} width={90} height={70} rx={8} fill="#1b2436" stroke="#38bdf8" strokeWidth={2} />
          <T x={365} y={95} s={11} c="#38bdf8" b>РЕЛЕ t</T>
          <path d="M 410 90 H 500" stroke="#c96f2e" strokeWidth={5} />
          <circle cx={545} cy={90} r={38} fill="#1b2436" stroke="#7d8ba1" strokeWidth={2} />
          {[0, 120, 240].map((a) => {
            const r = (a * Math.PI) / 180;
            return <ellipse key={a} cx={545 + Math.cos(r) * 18} cy={90 + Math.sin(r) * 18} rx={15} ry={7} fill="#8b98ad" transform={`rotate(${a} ${545} ${90})`} />;
          })}
          <T x={545} y={155} s={11} c="#64748f">вытяжка</T>
          <T x={300} y={195} s={11} c="#9db2d4">реле держит вентилятор 3–15 мин после выключения света</T>
        </>,
      );
    case 'smart-home':
      return box(
        <>
          <rect x={250} y={70} width={140} height={80} rx={12} fill="#1b2436" stroke="#c084fc" strokeWidth={2.5} />
          <T x={320} y={105} s={13} c="#c084fc" b>КОНТРОЛЛЕР</T>
          <T x={320} y={126} s={10} c="#64748f">локальная логика</T>
          {[
            ['СВЕТ', 80, 30],
            ['КЛИМАТ', 80, 180],
            ['ШТОРЫ', 500, 30],
            ['ДАТЧИКИ', 500, 180],
          ].map(([n, x, y]) => (
            <g key={n as string}>
              <rect x={x as number} y={y as number} width={110} height={44} rx={9} fill="#111a2a" stroke="#38bdf8" strokeWidth={2} />
              <T x={(x as number) + 55} y={(y as number) + 28} s={11} c="#38bdf8" b>{n as string}</T>
              <path
                d={`M ${(x as number) + ((x as number) < 300 ? 110 : 0)} ${(y as number) + 22} H ${(x as number) < 300 ? 250 : 390}`}
                stroke="#475569"
                strokeWidth={2}
                strokeDasharray="5 4"
              />
            </g>
          ))}
        </>,
      );
    case 'cable-lay':
      return box(
        <>
          <rect x={40} y={30} width={560} height={38} rx={4} fill="#3f3a33" />
          <T x={320} y={54} s={11} c="#a8a29e">грунт</T>
          <rect x={40} y={68} width={560} height={130} fill="#4a4136" opacity={0.6} />
          <rect x={200} y={95} width={240} height={12} rx={3} fill="#ef4444" />
          <T x={320} y={90} s={10} c="#f87171">сигнальная лента</T>
          <rect x={200} y={130} width={240} height={40} rx={4} fill="#d6c9a8" />
          <circle cx={320} cy={150} r={14} fill="#1c2839" stroke="#0f172a" strokeWidth={2} />
          <T x={320} y={190} s={10} c="#78716c">песчаная подушка 100 мм</T>
          <line x1={140} y1={68} x2={140} y2={150} stroke="#4ade80" strokeWidth={2} />
          <T x={100} y={115} s={11} c="#4ade80" a="middle">0,7 м</T>
        </>,
      );
    case 'protect-class':
      return box(
        <>
          {[
            ['I', 130, '⏚'],
            ['II', 320, '▣'],
            ['III', 510, '◇'],
          ].map(([n, x, s]) => (
            <g key={n as string}>
              <rect x={(x as number) - 70} y={45} width={140} height={110} rx={12} fill="#111a2a" stroke="#33465f" strokeWidth={2} />
              <T x={x as number} y={95} s={30} c="#ffc42e">{s as string}</T>
              <T x={x as number} y={130} s={13} c="#9db2d4" b>КЛАСС {n as string}</T>
              <T x={x as number} y={180} s={10.5} c="#64748f">
                {['заземление обязательно', 'двойная изоляция', 'сверхнизкое до 50 В'][['I', 'II', 'III'].indexOf(n as string)]}
              </T>
            </g>
          ))}
        </>,
      );
    case 'tools':
      return box(
        <>
          {[
            ['стриппер', 90],
            ['кримпер', 230],
            ['мультиметр', 370],
            ['индикатор', 510],
          ].map(([n, x], i) => (
            <g key={n as string}>
              <rect x={(x as number) - 55} y={50} width={110} height={100} rx={10} fill="#1b2436" stroke="#7d8ba1" strokeWidth={2} />
              {i === 0 && <path d={`M ${(x as number) - 25} 100 h 50 M ${(x as number) - 10} 85 v 30`} stroke="#f59e0b" strokeWidth={4} />}
              {i === 1 && <path d={`M ${(x as number) - 22} 78 l 44 44 M ${(x as number) + 22} 78 l -44 44`} stroke="#38bdf8" strokeWidth={4} />}
              {i === 2 && <rect x={(x as number) - 30} y={78} width={60} height={30} rx={4} fill="#0b111e" />}
              {i === 3 && <path d={`M ${x as number} 72 v 56`} stroke="#facc15" strokeWidth={6} />}
              <T x={x as number} y={175} s={11} c="#9db2d4">{n as string}</T>
            </g>
          ))}
        </>,
      );
    case 'loop':
    case 'cable-tray':
    default:
      return box(
        <>
          <rect x={100} y={60} width={440} height={100} rx={12} fill="rgba(96,128,180,0.06)" stroke="#33465f" strokeWidth={2} strokeDasharray="8 6" />
          <T x={320} y={115} s={13} c="#64748f">схема</T>
        </>,
      );
  }
}
