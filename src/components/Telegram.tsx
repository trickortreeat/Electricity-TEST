import { Send } from 'lucide-react';

export const TG_URL = 'https://t.me/irawiq';

/** Компактная плашка-ссылка на автора (используется на всех экранах) */
export function TgBadge({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href={TG_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="Автор проекта — @irawiq в Telegram"
      className={`group inline-flex items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 font-bold text-sky-300 transition hover:border-sky-400 hover:bg-sky-500/20 ${
        compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs'
      }`}
    >
      <Send className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      @irawiq
    </a>
  );
}

/** Мелкая сноска о статусе продукта — для внутренних экранов */
export function MvpNote({ className = '' }: { className?: string }) {
  return (
    <p className={`text-[10px] leading-relaxed text-slate-600 ${className}`}>
      <span className="mr-1 rounded bg-slate-700/60 px-1 py-0.5 font-mono text-[8.5px] font-bold text-slate-300">MVP</span>
      Демоверсия. Полная SaaS-платформа — ближе к зиме. Баги и недоработки устраняются, замечания приветствуются:{' '}
      <a href={TG_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-sky-500 underline">
        @irawiq
      </a>
    </p>
  );
}

/** Большая карточка автора для главной страницы */
export function TgCard() {
  return (
    <a
      href={TG_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 to-transparent p-5 transition hover:border-sky-400/60 hover:from-sky-500/20"
    >
      <div className="rounded-2xl bg-sky-500/15 p-3.5 transition group-hover:scale-105">
        <Send className="h-7 w-7 text-sky-300" />
      </div>
      <div className="min-w-0">
        <div className="font-display text-base text-white">Проект собрал и разработал @irawiq</div>
        <div className="mt-1 text-sm text-slate-400">
          Идеи, замечания и заказ доработок — пишите в Telegram: <span className="font-bold text-sky-300 underline">t.me/irawiq</span>
        </div>
      </div>
      <span className="ml-auto hidden shrink-0 rounded-xl bg-sky-500/20 px-4 py-2 font-display text-xs tracking-wide text-sky-200 transition group-hover:bg-sky-500/30 sm:block">
        НАПИСАТЬ
      </span>
    </a>
  );
}
