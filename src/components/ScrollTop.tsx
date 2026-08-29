import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { sfx } from '../audio';

/**
 * Кнопка «Наверх» — появляется при прокрутке и возвращает страницу в начало.
 * Работает как для прокрутки окна, так и для внутренних скролл-контейнеров.
 */
export default function ScrollTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setShow(y > 280);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toTop = () => {
    sfx.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // на случай, если прокручивается внутренний контейнер
    document.documentElement.scrollTo?.({ top: 0, behavior: 'smooth' });
    document.body.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={toTop}
      aria-label="Наверх"
      title="Наверх"
      className={`group fixed right-3 bottom-3 z-[92] flex h-12 w-12 items-center justify-center rounded-2xl border border-volt/40 bg-[#0b1220]/95 text-volt shadow-[0_10px_30px_-8px_rgba(0,0,0,0.8)] backdrop-blur transition-all duration-300 hover:border-volt hover:bg-volt/15 active:scale-95 sm:right-5 sm:bottom-5 ${
        show ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <ArrowUp className="h-5 w-5 transition group-hover:-translate-y-0.5" />
      <span className="pulse-ring pointer-events-none absolute inset-0 rounded-2xl" />
    </button>
  );
}
