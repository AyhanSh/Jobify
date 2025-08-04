import { useState, useEffect } from 'react';

export const useMobileDetection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            // Check screen width (mobile breakpoint)
            const isSmallScreen = window.innerWidth < 768;

            // Check user agent for mobile devices
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

            // Consider it mobile if either condition is true
            const isMobileDevice = isSmallScreen || isMobileUserAgent;

            setIsMobile(isMobileDevice);
        };

        // Check on mount
        checkMobile();

        // Add event listener for window resize
        window.addEventListener('resize', checkMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}; 