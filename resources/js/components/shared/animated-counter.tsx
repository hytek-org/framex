import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type AnimatedCounterProps = {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    className?: string;
};

export function AnimatedCounter({
    value,
    duration = 1500,
    prefix = '',
    suffix = '',
    decimals = 0,
    className,
}: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const startRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        startRef.current = null;

        const animate = (timestamp: number) => {
            if (startRef.current === null) {
                startRef.current = timestamp;
            }
            const progress = Math.min(
                (timestamp - startRef.current) / duration,
                1,
            );

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(eased * value);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [value, duration]);

    const formatted = displayValue.toFixed(decimals);
    const parts = formatted.split('.');
    const intPart = Number(parts[0]).toLocaleString();
    const decPart = parts[1];

    return (
        <span className={cn('tabular-nums', className)}>
            {prefix}
            {intPart}
            {decimals > 0 && `.${decPart}`}
            {suffix}
        </span>
    );
}
