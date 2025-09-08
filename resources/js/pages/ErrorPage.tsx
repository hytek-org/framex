import ErrorLayout from '@/layouts/ErrorLayout';
import { Head } from '@inertiajs/react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
interface ErrorPageProps {
  status: number;
  message?: string;
}

const ERROR_MESSAGES: Record<number | 'default', { title: string; description: string; icon?: React.ReactNode }> = {
    400: { 
        title: 'Bad Request', 
        description: 'The request could not be understood or was missing required parameters.',
        icon: <AlertTriangle className="w-6 h-6" />
    },
    401: { 
        title: 'Unauthorized', 
        description: 'Authentication is required to access this resource.',
        icon: <AlertTriangle className="w-6 h-6" />
    },
    402: { 
        title: 'Payment Required', 
        description: 'Payment is required to access this content.',
        icon: <AlertTriangle className="w-6 h-6" />
    },
    403: { 
        title: 'Forbidden', 
        description: 'You do not have permission to access this resource.',
        icon: <AlertTriangle className="w-6 h-6" />
    },
    404: { 
        title: 'Page Not Found', 
        description: 'The page you are looking for could not be found.',
        icon: <Home className="w-6 h-6" />
    },
    405: { 
        title: 'Method Not Allowed', 
        description: 'The request method is not supported for this resource.',
        icon: <AlertTriangle className="w-6 h-6" />
    },
    408: { 
        title: 'Request Timeout', 
        description: 'The server timed out waiting for the request.',
        icon: <RefreshCw className="w-6 h-6" />
    },
    411: { 
        title: 'Length Required', 
        description: 'The request did not specify the length of its content.',
        icon: <AlertTriangle className="w-6 h-6" />
    },
    413: { 
        title: 'Payload Too Large', 
        description: 'The request is larger than the server is willing to process.',
        icon: <AlertTriangle className="w-6 h-6" />
    },
    414: { 
        title: 'URI Too Long', 
        description: 'The URI provided was too long for the server to process.',
        icon: <AlertTriangle className="w-6 h-6" />
    },
    415: { 
        title: 'Unsupported Media Type', 
        description: 'The request entity has a media type which the server does not support.',
        icon: <AlertTriangle className="w-6 h-6" />
    },
    418: { 
        title: "I'm a Teapot", 
        description: 'The server refuses to brew coffee because it is, permanently, a teapot.',
        icon: <span className="text-2xl">🫖</span>
    },
    419: { 
        title: 'Session Expired', 
        description: 'Your session has expired. Please refresh the page to continue.',
        icon: <RefreshCw className="w-6 h-6" />
    },
    429: { 
        title: 'Too Many Requests', 
        description: 'You have made too many requests in a short period. Please wait and try again.',
        icon: <AlertTriangle className="w-6 h-6" />
    },
    500: { 
        title: 'Internal Server Error', 
        description: 'The server encountered an unexpected condition that prevented it from fulfilling the request.',
        icon: <AlertTriangle className="w-6 h-6" />
    },
    502: { 
        title: 'Bad Gateway', 
        description: 'The server received an invalid response from the upstream server.',
        icon: <AlertTriangle className="w-6 h-6" />
    },
    503: { 
        title: 'Service Unavailable', 
        description: 'The server is currently unavailable due to maintenance or overload.',
        icon: <RefreshCw className="w-6 h-6" />
    },
    504: { 
        title: 'Gateway Timeout', 
        description: 'The server did not receive a timely response from the upstream server.',
        icon: <RefreshCw className="w-6 h-6" />
    },
    default: { 
        title: 'Unknown Error', 
        description: 'An unexpected error has occurred. Please try again later.',
        icon: <AlertTriangle className="w-6 h-6" />
    },
};

const ErrorPage: React.FC<ErrorPageProps> = ({ status, message }) => {
   const { title, description, icon } = ERROR_MESSAGES[status] || ERROR_MESSAGES.default;

  return (
    <ErrorLayout>
            <Head title={`${status} - ${title}`} />
            
            {/* Error Status Display */}
            <div className="mb-8">
                <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {icon}
                    </div>
                </div>
                <h1 className="text-8xl sm:text-9xl font-black text-zinc-900 dark:text-zinc-100 mb-4 tracking-tight">
                    {status}
                </h1>
            </div>

            {/* Error Details */}
            <div className="space-y-6 mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {title}
                </h2>
                
                <div className="space-y-4">
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
                        {description}
                    </p>
                    
                    {message && (
                        <div className="border-l-4 border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-r-lg">
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                                Additional Information:
                            </p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                {message}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Help Text */}
            <div className="text-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    If this problem persists, please contact support or try refreshing the page.
                </p>
            </div>
        </ErrorLayout>
  );
};

export default ErrorPage;