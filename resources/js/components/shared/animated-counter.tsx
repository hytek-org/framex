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
    const [isInView, setIsInView] = useState(false);
    
    const counterRef = useRef<HTMLSpanElement>(null);
    const startRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    // 1. Observe when the component scrolls into the viewport
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    // Disconnect after triggering once so it doesn't restart on scroll up/down

                    if (counterRef.current) {
                        observer.unobserve(counterRef.current);
                    }
                }
            },
            { threshold: 0.1 } // Triggers when at least 10% of the element is visible
        );

        const currentElement = counterRef.current;

        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, []);

    // 2. Run the animation ONLY when isInView becomes true
    useEffect(() => {
        if (!isInView) {
            return; // Wait until it's on screen
        }

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
    }, [value, duration, isInView]);

    const formatted = displayValue.toFixed(decimals);
    const parts = formatted.split('.');
    const intPart = Number(parts[0]).toLocaleString();
    const decPart = parts[1];

    return (
        <span ref={counterRef} className={cn('tabular-nums', className)}>
            {prefix}
            {intPart}
            {decimals > 0 && `.${decPart}`}
            {suffix}
        </span>
    );
}