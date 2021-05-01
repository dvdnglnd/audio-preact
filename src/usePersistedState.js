import localforage from "localforage";

export function usePersistedState(keyToPersistWith, defaultState) {
    const [state, setState] = useState(undefined);

    useEffect(() => {
        localforage.getItem(keyToPersistWith).then(retrievedState => setState(retrievedState ?? defaultState));
    }, [keyToPersistWith, setState, defaultState]);

    const setPersistedValue = useCallback((newValue) => {
        setState(newValue);
        localforage.setItem(keyToPersistWith, newValue);
    }, [keyToPersistWith, setState]);
    return [state, setPersistedValue];
}