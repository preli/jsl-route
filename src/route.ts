
let routesStore = {};
let notFoundHandler: (route: string, params: string[]) => void;
const watchers = [];

const lazyLoadedUrls: {[key: string]: Promise<void>} = {};

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

function lazyLoadLib(url: string, type: "script" | "link", finished: () => void) {

    const tag = document.createElement(type);
    tag.onload = function() {
        finished();
    };
    if (type === "link") {
        (tag as HTMLLinkElement).href = url;
        (tag as HTMLLinkElement).rel = "stylesheet";
    } else {
        (tag as HTMLScriptElement).src = url;
    }
    document.head.appendChild(tag);
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
    },

    lazyLoad(url: string, type?: "script" | "link"): Promise<void> {

        if (lazyLoadedUrls.hasOwnProperty(url)) {
            return lazyLoadedUrls[url];
        }

        const t = type || (url.endsWith(".css") ? "link" : "script");
        if (!(window as any).Promise) {
            // promise not supported by browser
            throw new Error("Promise is not supported by your browser. This feature is required for JSLRoute.lazyLoad");
        } else {
            return lazyLoadedUrls[url] = new Promise(
                function(resolve, reject) {
                    lazyLoadLib(url, t, resolve);
                });
        }
    }
};
