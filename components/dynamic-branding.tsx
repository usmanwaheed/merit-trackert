"use client"

import { useEffect } from "react"
import { usePlatformSettings } from "@/lib/hooks/use-platform-settings"

export function DynamicBranding() {
    const { data: settings } = usePlatformSettings()

    useEffect(() => {
        if (!settings) return

        // Apply primary color if set
        if (settings.primaryColor) {
            // We assume the CSS variables for primary are --primary and --primary-foreground
            // We might need to convert hex to HSL for Shadcn compatibility
            const root = document.documentElement

            // Simple utility to convert hex to HSL (simplified for this context)
            // In a real app, you'd use a more robust color library
            const hexToHSL = (hex: string) => {
                let r = 0, g = 0, b = 0;
                if (hex.length === 4) {
                    r = parseInt(hex[1] + hex[1], 16);
                    g = parseInt(hex[2] + hex[2], 16);
                    b = parseInt(hex[3] + hex[3], 16);
                } else if (hex.length === 7) {
                    r = parseInt(hex.slice(1, 3), 16);
                    g = parseInt(hex.slice(3, 5), 16);
                    b = parseInt(hex.slice(5, 7), 16);
                }
                r /= 255; g /= 255; b /= 255;
                const max = Math.max(r, g, b), min = Math.min(r, g, b);
                let h = 0, s, l = (max + min) / 2;
                if (max === min) {
                    h = s = 0;
                } else {
                    const d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    switch (max) {
                        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                        case g: h = (b - r) / d + 2; break;
                        case b: h = (r - g) / d + 4; break;
                    }
                    h /= 6;
                }
                return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
            }

            try {
                const hsl = hexToHSL(settings.primaryColor);
                root.style.setProperty('--primary', hsl);
            } catch (e) {
                console.error("Failed to apply primary color", e);
            }
        }

        // Apply favicon
        if (settings.faviconUrl) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']")
            if (!link) {
                link = document.createElement('link')
                link.rel = 'icon'
                document.getElementsByTagName('head')[0].appendChild(link)
            }
            link.href = settings.faviconUrl
        }

        // Set Document Title if dynamic title is preferred
        if (settings.platformName) {
            document.title = settings.platformName
        }

    }, [settings])

    return null
}
