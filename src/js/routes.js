/**
 * @fileoverview This file defines the browser URL routes for the ORS Viewer application.
 */

/** @jsx vNode */
import Router from '@ocdla/routing/Router';
// import NotFound from '@ocdla/global-components/src/NotFound';
import Search from './components/Search';
import Volumes_Toc from './components/toc/Volumes_Toc';
import Titles_Toc from './components/toc/Titles_Toc';
import Chapters_Toc from './components/toc/Chapters_Toc';
import Sections_Toc from './components/toc/Sections_Toc';
import Chapter from './components/Chapter';

const router = new Router(BASE_PATH || '/');
export default router;

switch (APP_NAME) {
    case 'bon':
        router.addRoute('/', 'xyz');
        break;
    case 'ors':
        router.addRoute('/', Search);
        router.addRoute('/toc', Volumes_Toc, {
            division: 'Volumes',
            title: 'OREGON REVISED STATUTES'
        });
        router.addRoute('/toc/volume/(\\w+)', Titles_Toc, {
            division: 'Titles'
        });
        router.addRoute('/toc/title/(\\w+)', Chapters_Toc, {
            division: 'Chapters'
        });
        // router.addRoute('/chapter/[+-]?([0-9]*[.])?[0-9]+', Sections_Toc, {
        // router.addRoute('/chapter/(\\w+)', Chapter);
        router.addRoute('/chapter/(\\w+)', Chapter);
        router.addRoute('/toc/chapter/(\\w+)', Sections_Toc, {
            division: 'Sections'
        });
        // router.addRoute('/section/(\\w+)', Ors_Body);
        // router.addRoute('/toc/section/(\\w+)\\.(\\w+)', Chapter);
        // router.addRoute('/section/(\\d+)\\.(\\d+)', Ors_Body);
        // router.addRoute('/toc/section/(\\d+)\\.(\\d+)', Ors_Body, {
        // router.addRoute('/toc/section/[+-]?([0-9]*[.])?[0-9]+', Ors_Body);
        break;
}
