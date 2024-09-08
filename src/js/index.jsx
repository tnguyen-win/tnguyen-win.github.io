/**
 * @fileoverview This file is the root of the ORS Viewer application.
 */

/** @jsx vNode */
import '../css/input.css';
/* eslint-disable no-unused-vars */
import { vNode, View } from '@ocdla/view';
import App from './App';
/* eslint-enable */
import HttpClient from '@ocdla/lib-http/HttpClient';
import OrsMock from './mock/OrsMock';
import router from './routes';
import Titles_Toc from './components/toc/Titles_Toc';
import Chapters_Toc from './components/toc/Chapters_Toc';
import Sections_Toc from './components/toc/Sections_Toc';
import Chapter from './components/Chapter';
import { getBreadcrumbs } from './functions/ors/fetch_data';

console.log(`IS_PRODUCTION - ${BASE_PATH}`);

if (USE_LOCAL_STATUTES_XML)
    HttpClient.register('https://ors.ocdla.org', new OrsMock());

// Available Types: 'bon' || 'ors'.
const currentAppType = APP_NAME;
const headerPinned = false;
const $root = document.getElementById('root');
const root = View.createRoot($root);
const [Component, props] = router.match(
    window.location.pathname,
    window.location.hash
);
let breadcrumbItems;

switch (Component) {
    case Titles_Toc:
        breadcrumbItems = getBreadcrumbs('titles', props.volume);
        break;
    case Chapters_Toc:
        breadcrumbItems = getBreadcrumbs('chapters', props.title);
        break;
    case Sections_Toc:
        breadcrumbItems = getBreadcrumbs('sections', props.chapter);
        break;
    case Chapter:
        breadcrumbItems = getBreadcrumbs('chapter', props.chapter, props.hash);

        // window.addEventListener('hashchange', () => window.location.reload());

        window.addEventListener('hashchange', href => {
            breadcrumbItems = getBreadcrumbs(
                'chapter',
                props.chapter,
                href.newURL.split('#')[1]
            );

            root.render(
                <App
                    view={root}
                    currentAppType={currentAppType}
                    headerPinned={headerPinned}
                    breadcrumbs={breadcrumbItems}>
                    <Component {...props} />
                </App>
            );
        });
        // const currentHash = window.location.hash;
        // window.location.hash = currentHash + '_temp';
        // window.location.hash = currentHash;

        // const currentHash = window.location.hash;
        // history.replaceState(null, '', currentHash + '_temp');
        // history.replaceState(null, '', currentHash);
        break;
    default:
        breadcrumbItems = getBreadcrumbs();
        break;
}

root.render(
    <App
        view={root}
        currentAppType={currentAppType}
        headerPinned={headerPinned}
        breadcrumbs={breadcrumbItems}>
        <Component {...props} />
    </App>
);

if (BASE_PATH) {
    // const links = document.querySelectorAll('a');

    // links.forEach(link =>
    //     link.href && !link.href.startsWith('http')
    //         ? (link.href =
    //               BASE_PATH + link.getAttribute('href').replace(/^\//, ''))
    //         : ''
    // );
    console.log(BASE_PATH);
}
