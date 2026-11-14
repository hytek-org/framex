import { cn } from '@/lib/utils';

export default function AppLogoIcon({ className }: { className?: string }) {
    return (
        <svg
            className={cn('h-7 w-7', className)}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width="32" height="32" rx="8" fill="currentColor" className="text-primary" />
            <path
                d="M9 10h14M9 16h10M9 22h6"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    );
}
