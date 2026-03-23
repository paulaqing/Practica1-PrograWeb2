export function createRouterStore() {
    let currentPath = $state(window.location.pathname);

    // Initial listener for popstate (back/forward buttons)
    window.addEventListener('popstate', () => {
        currentPath = window.location.pathname;
    });

    return {
        get path() { return currentPath; },
        navigate: (to) => {
            window.history.pushState(null, '', to);
            currentPath = to;
        }
    };
}

export const router = createRouterStore();
