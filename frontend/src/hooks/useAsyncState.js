import { useCallback, useState } from "react";

export default function useAsyncState(asyncFn, initialValue) {
    const [value, setValue] = useState(initialValue);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const run = useCallback(
        async (...args) => {
            setLoading(true);
            setError(null);
            try {
                const result = await asyncFn(...args);
                setValue(result);
                return result;
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [asyncFn]
    );

    return { value, loading, error, run };
}
