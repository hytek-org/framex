import { motion } from 'motion/react';
import type { MotionProps } from 'motion/react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

// ── Fade In ──────────────────────────────────────────────
type FadeInProps = ComponentProps<'div'> & {
    delay?: number;
    duration?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    viewportMargin?: string;
};

const directionMap = {
    up: { y: 24 },
    down: { y: -24 },
    left: { x: 24 },
    right: { x: -24 },
    none: {},
};

export function FadeIn({
    children,
    className,
    delay = 0,
    duration = 0.7,
    direction = 'up',
    viewportMargin = '-50px',
    ...props
}: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, ...directionMap[direction] }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: viewportMargin }}
            transition={{
                duration,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98], // Apple-style custom cubic-bezier
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
    viewportMargin?: string;
};

export function StaggerChildren({
    children,
    className,
    staggerDelay = 0.1,
    initialDelay = 0,
    viewportMargin = '-50px',
    ...props
}: StaggerProps) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: viewportMargin }}
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
                hidden: { opacity: 0, y: 20 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.6,
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
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
                duration: 0.5,
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
// Notice this one STILL uses `animate` instead of `whileInView` 
// because you want page transitions to happen immediately on mount.
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
                duration: 0.4,
                ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className={cn('h-full', className)}
        >
            {children}
        </motion.div>
    );
}