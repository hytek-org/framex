import ErrorLayout from '@/layouts/ErrorLayout';
import { Head } from '@inertiajs/react';

interface ErrorPageProps {
  status: number;
  message?: string;
}

const ERROR_MESSAGES: Record<number | 'default', { title: string; description: string }> = {
  400: { title: 'Bad Request', description: 'Invalid request. Please check and retry.' },
  401: { title: 'Unauthorized', description: 'Authentication required.' },
  402: { title: 'Payment Required', description: 'Payment needed for access.' },
  403: { title: 'Forbidden', description: 'Access denied.' },
  404: { title: 'Page Not Found', description: 'Requested page not found.' },
  405: { title: 'Method Not Allowed', description: 'Invalid access method.' },
  408: { title: 'Request Timeout', description: 'Server response timed out.' },
  411: { title: 'Length Required', description: 'Content length missing.' },
  413: { title: 'Payload Too Large', description: 'Request size exceeds limit.' },
  414: { title: 'URI Too Long', description: 'URL exceeds length limit.' },
  415: { title: 'Unsupported Media Type', description: 'Unsupported format.' },
  418: { title: "I'm a Teapot", description: 'Server is a teapot, not a coffee maker. ☕' },
  419: { title: 'Session Expired', description: 'Session expired. Please refresh.' },
  429: { title: 'Too Many Requests', description: 'Rate limit exceeded.' },
  500: { title: 'Server Error', description: 'Internal server error.' },
  502: { title: 'Bad Gateway', description: 'Invalid upstream response.' },
  503: { title: 'Service Unavailable', description: 'Under maintenance.' },
  504: { title: 'Gateway Timeout', description: 'Upstream server timeout.' },
  default: { title: 'Unknown Error', description: 'Unexpected error occurred.' },
};

const ErrorPage: React.FC<ErrorPageProps> = ({ status, message }) => {
  const { title, description } = ERROR_MESSAGES[status] || ERROR_MESSAGES.default;

  return (
    <ErrorLayout>
      <Head title={`${status} - ${title}`} />
      <div className="relative animate-fade-in">
        <h1 className="text-[160px] sm:text-[200px] font-extrabold  leading-none drop-shadow-lg">
          {status}
        </h1>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <p className="text-lg sm:text-xl font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full shadow-md">
            Error
          </p>
        </div>
      </div>

      <h2 className="text-3xl sm:text-5xl font-bold mt-8 mb-6 bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-200 bg-clip-text text-transparent leading-tight">
        Oops! {title}
      </h2>

      <div className="max-w-2xl mx-auto text-center">
        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-6 px-4 leading-relaxed">
          {description}
        </p>
        {message && (
          <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 mb-6 px-4 italic bg-zinc-50 dark:bg-zinc-800/50 rounded-lg py-2">
            {message}
          </p>
        )}
      </div>
    </ErrorLayout>
  );
};

export default ErrorPage;