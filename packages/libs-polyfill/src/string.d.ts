export {};
declare global {
    interface String {
        asNumber: () => number | null;
    }
}
