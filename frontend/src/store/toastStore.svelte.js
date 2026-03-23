export function createToastStore() {
    let toasts = $state([]);
    let counter = 0;

    return {
        get toasts() { return toasts; },
        add: (message, type = 'info', duration = 3000) => {
            const id = counter++;
            toasts = [...toasts, { id, message, type }];
            setTimeout(() => {
                toasts = toasts.filter(t => t.id !== id);
            }, duration);
        },
        remove: (id) => {
            toasts = toasts.filter(t => t.id !== id);
        }
    };
}

export const toastState = createToastStore();
