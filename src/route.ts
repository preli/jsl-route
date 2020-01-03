
let routesStore = {};
let notFoundHandler;
const watchers = [];

function updateRoute(hash?: string) {
    const route = (hash || location.hash || "#").substr(1).split("/");
    for (let i = 0; i < watchers.length; i++) {
        if (watchers[i](hash) === false) {
            return;
        }
    }
    if (routesStore[route[0]]) {
        routesStore[route[0]](route.slice(1));
    } else if (notFoundHandler) {
        notFoundHandler(route[0], route.slice(1));
    }
}

export let JSLRoute = {
    setup(routes: { [route: string]: ((params: string[]) => void) },
            notFound?: (route: string, params: string[]) => void) {
        notFoundHandler = notFound;
        routesStore = routes;
        window.addEventListener("hashchange", () => updateRoute());
        updateRoute();
    },

    navigate(route: string, noHashUpdate?: boolean) {
        if (!route || route[0] !== "#") {
            route = "#" + (route || "");
        }
        if (noHashUpdate) {
            updateRoute(route);
        } else {
            window.location.hash = route;
        }
    },

    onNavigate(fnc: (url: string) => boolean | void) {
        watchers.push(fnc);
    }
};

