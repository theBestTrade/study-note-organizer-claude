import { clsx } from 'clsx';

interface Toast {
  id: number;
  message: string;
}

interface Props {
  toasts: Toast[];
}

export function ToastContainer({ toasts }: Props) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={clsx(
            'px-4 py-2.5 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm shadow-lg',
            'fade-in pointer-events-none'
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
