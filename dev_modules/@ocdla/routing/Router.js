// This import requires the defining of its extension type, otherwise there's an error.
import NotFound from '@ocdla/global-components/src/NotFound.jsx';

export default class Router {
    constructor(basePath) {
        // constructor(route, component) {
        this.routes = [];
        this.basePath = basePath;
        // this.addRoute(route, component);

        // if (this.routes.length !== 0) {
        //     if (!sessionStorage.getItem('init')) {
        //         history.pushState({}, '', route);

        //         sessionStorage.setItem('init', 'false');
        //     }
        // }
    }

    addRoute(path, component = NotFound, params = {}) {
        const routeExists = this.routes.find(r => r.route === path);

        if (routeExists) {
            routeExists.id = id;
            routeExists.component = component;
        } else this.routes.push({ route: path, component, params });
    }

    match(path, hash) {
        // Leave the root path alone; compensate for any trailing slashes.
        const normalized = path === '/' ? '/' : path.replace(/\/+$/, '');
        const parts = normalized.split('/');
        const _var = parts.length > 2 ? parts[parts.length - 2] : null;

        for (const r in this.routes.reverse()) {
            let { route, component, params } = this.routes[r];

            route = route.replaceAll('/', '\\/');

            // May need to add in modifiers / flags.
            const re = new RegExp(route);
            const matches = path.match(re);

            // If matches is null, then there wasn't a match.
            if (matches) {
                if (null !== _var) {
                    params[_var] = matches[1];
                    params['hash'] = hash;
                }

                return [component, params];
            }
        }

        return [NotFound, {}];
    }
}
