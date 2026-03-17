import { useEffect, useRef, useCallback } from "react";

type PollingCallback = () => void;

/**
 * A hook that provides a reliable way to sweep for order updates
 * when WebSockets are unavailable or unreliable (e.g. cPanel).
 * 
 * @param onUpdate Callback function to trigger when an update is needed (e.g. loadInvoices)
 * @param interval Frequency of sweep in milliseconds (default: 10 seconds)
 */
export function useOrdersPolling(onUpdate: PollingCallback, interval: number = 10000) {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const savedCallback = useRef<PollingCallback>(onUpdate);

    // Keep the latest callback reference
    useEffect(() => {
        savedCallback.current = onUpdate;
    }, [onUpdate]);

    useEffect(() => {
        // Initial run
        const tick = () => {
            savedCallback.current();
        };

        // Set up the interval
        timerRef.current = setInterval(tick, interval);

        // Cleanup on unmount
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [interval]);

    return {
        // Manual trigger if needed
        refresh: () => savedCallback.current()
    };
}
