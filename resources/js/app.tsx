import { createInertiaApp } from "@inertiajs/react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initializeTheme } from "@/hooks/use-appearance";
import AppLayout from "@/layouts/app-layout";
import AuthLayout from "@/layouts/auth-layout";
import AccountLayout from "@/layouts/account/layout";
import { configureEcho } from "@laravel/echo-react";
import { useFlashToast } from "./hooks/use-flash-toast";
import MarketingLayout from "./layouts/marketing-layout";
import DocsLayout from "./layouts/docs-layout";
import PublicFormLayout from "./layouts/public-form-layout";

configureEcho({
    broadcaster: "reverb",
});
function ToastListener() {
    useFlashToast();

    return null;
}

const appName = import.meta.env.VITE_APP_NAME || "FrameX";

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === "welcome":
            case name === "pricing":
            case name === "features":
            case name === "about":
            case name === "contact":
            case name.startsWith("blogs/"):
            case name.startsWith("categories/"):
            case name.startsWith("tags/"):
                return MarketingLayout;
            case name.startsWith("auth/"):
                return AuthLayout;
            case name.startsWith("docs/"):
                return DocsLayout;
            case name.startsWith("forms/"):
                return PublicFormLayout;
            case name.startsWith("account/"):
            case name.startsWith("teams/"):
                return [AppLayout, AccountLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
                <ToastListener />
            </TooltipProvider>
        );
    },
    progress: {
         color: 'oklch(0.55 0.22 275)',
    },
});

// This will set light / dark mode on load...
initializeTheme();
