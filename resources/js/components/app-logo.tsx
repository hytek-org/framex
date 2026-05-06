import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <AppLogoIcon className="h-7 w-7" />
            <span className="text-base font-semibold tracking-tight text-foreground truncate">
                FrameX
            </span>
        </div>
    );
}
