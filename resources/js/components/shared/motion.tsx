import { motion, type MotionProps } from 'motion/react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

// ── Fade In ──────────────────────────────────────────────
type FadeInProps = ComponentProps<'div'> & {
    delay?: number;
    duration?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
};

const directionMap = {
    up: { y: 16 },
    down: { y: -16 },
    left: { x: 16 },
    right: { x: -16 },
    none: {},
};

export function FadeIn({
    children,
    className,
    delay = 0,
    duration = 0.5,
    direction = 'up',
    ...props
}: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, ...directionMap[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{
                duration,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className={className}
            {...(props as MotionProps)}
        >
            {children}
        </motion.div>
    );
}

// ── Stagger Container ────────────────────────────────────
type StaggerProps = ComponentProps<'div'> & {
    staggerDelay?: number;
    initialDelay?: number;
};

export function StaggerChildren({
    children,
    className,
    staggerDelay = 0.05,
    initialDelay = 0,
    ...props
}: StaggerProps) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: staggerDelay,
                        delayChildren: initialDelay,
                    },
                },
            }}
            className={className}
            {...(props as MotionProps)}
        >
            {children}
        </motion.div>
    );
}

// ── Stagger Item (use as child of StaggerChildren) ───────
export function StaggerItem({
    children,
    className,
    ...props
}: ComponentProps<'div'>) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.4,
                        ease: [0.21, 0.47, 0.32, 0.98],
                    },
                },
            }}
            className={className}
            {...(props as MotionProps)}
        >
            {children}
        </motion.div>
    );
}

// ── Scale In ─────────────────────────────────────────────
export function ScaleIn({
    children,
    className,
    delay = 0,
    ...props
}: ComponentProps<'div'> & { delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.3,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className={className}
            {...(props as MotionProps)}
        >
            {children}
        </motion.div>
    );
}

// ── Page Transition Wrapper ──────────────────────────────
export function PageTransition({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.35,
                ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className={cn('h-full', className)}
        >
            {children}
        </motion.div>
    );
}
