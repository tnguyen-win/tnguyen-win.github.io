/**
 * @fileoverview This file contains ORS Viewer fetch functions.
 */

import OrsMock from '../../mock/OrsMock';
import Url from '@ocdla/lib-http/Url';
import HttpClient from '@ocdla/lib-http/HttpClient';
import OrsChapter from '@ocdla/ors/src/Chapter';

if (USE_LOCAL_STATUTES_XML)
    HttpClient.register('https://ors.ocdla.org', new OrsMock());

const baseUrl = '/toc';
const client = new HttpClient();
const req = new Request('https://ors.ocdla.org/index.xml');
// const req = new Request(
//     'https://raw.githubusercontent.com/ocdladefense/ors-viewer/toc/src/data/xml/ors_viewer/statutes.xml'
// );
const resp = await client.send(req);
const xml = await resp.text();
const parser = new DOMParser();
const parsedXML = parser.parseFromString(xml, 'application/xml');

/**
 * @description Gets a certain element from a previously fetched XML file.
 * @example
 *  getNode(7)
 * @param {number} paramId - Accepts an integer as the id of the wanted element.
 * @returns {HTMLElement} Returns an array of [volume] objects.
 */

export const getNode = paramId => {
    return parsedXML.getElementById(paramId);
};

/**
 * @description Gets all of the volumes from a previously fetched XML file.
 * @example
 * getVolumes()
 * @returns {string} Returns an array of [volume] objects.
 */

export const getVolumes = () => {
    const xmlVolumes = parsedXML.getElementsByTagName('volume');
    let jsonArray = [];

    Array.from(xmlVolumes).forEach($volume => {
        const volumeId = $volume.getAttribute('id').split('-')[1];
        const volumeHref = baseUrl + '/volume/' + volumeId;
        const volumeName = $volume.getAttribute('name');
        const volumeVolumes = $volume.getElementsByTagName('title');
        const volumeFirstChild = volumeVolumes[0];
        const volumeLastChild =
            volumeVolumes[Object.keys(volumeVolumes).at(-1)];
        // volumeVolumes[volumeVolumes.length - 1];
        const volumeChapterRange =
            'Chapters ' +
            volumeFirstChild.getAttribute('range').split('-')[0] +
            '-' +
            volumeLastChild.getAttribute('range').split('-')[1];

        jsonArray.push({
            href: volumeHref,
            id: volumeId,
            heading: volumeName,
            label: volumeChapterRange
        });
    });

    return jsonArray;
};

/**
 * @description Gets all of the chapters for a title from a previously fetched XML file.
 * @example
 * getTitles(7)
 * @param {number} paramId - Accepts an integer as the id of the wanted title.
 * @returns {string} Returns an array of [chapter] objects.
 */

export const getTitles = paramId => {
    const xmlTitles = parsedXML.getElementsByTagName('title');
    let jsonArray = [];

    Array.from(xmlTitles).forEach($title => {
        const titleId = $title.getAttribute('id').split('-')[1];
        const titleHref = baseUrl + '/title/' + titleId;
        const titleName = $title.getAttribute('name');
        const titleChapterRange = 'Chapters ' + $title.getAttribute('range');
        const volumeId = $title.parentElement.getAttribute('id').split('-')[1];

        if (paramId === volumeId) {
            jsonArray.push({
                href: titleHref,
                id: titleId,
                heading: titleName,
                label: titleChapterRange
            });
        }
    });

    return jsonArray;
};

/**
 * @description Gets all of the sections for a chapter from a previously fetched XML file.
 * @example
 * getChapters(7)
 * @param {number} paramId - Accepts an integer as the id of the wanted chapter.
 * @returns {string} Returns an array of [section] objects.
 */

export const getChapters = paramId => {
    const xmlChapters = parsedXML.getElementsByTagName('chapter');
    let jsonArray = [];

    Array.from(xmlChapters).forEach($chapter => {
        const titleId = $chapter.parentElement.getAttribute('id').split('-')[1];
        const chapterId = $chapter.getAttribute('id').split('-')[1];
        const chapterHref = baseUrl + '/chapter/' + chapterId;
        const chapterName = $chapter.getAttribute('name');

        if (paramId === titleId) {
            jsonArray.push({
                href: chapterHref,
                id: chapterId,
                label: chapterName
            });
        }
    });

    return jsonArray;
};

/**
 * @description Gets all of the sections for a chapter from fetched data from a remote PHP file.
 * @example
 * getSections(7, '1010', true)
 * @param {number} paramId - Accepts an integer as the id of the wanted chapter.
 * @param {string} hash - Accepts a string as the id of the wanted section.
 * @param {boolean} [fromSidebar] - Optionally accepts a boolean to determine whether the fetched sections are for sidebar first.
 * @returns {string} Returns an array of [section] objects.
 */

export const getSections = async (paramId, hash, fromSidebar) => {
    // const url = new Url('https://ors.ocdla.org/index.xml');
    const url = new Url('https://appdev.ocdla.org/books-online/index.php');

    url.buildQuery('chapter', paramId.toString());

    const client = new HttpClient();
    const req = new Request(url.toString());
    const resp = await client.send(req);
    const msword = await OrsChapter.fromResponse(resp);
    const xml = OrsChapter.toStructuredChapter(msword);
    let jsonArray = [];

    xml.sectionTitles.map(($section, sectionIndex) => {
        const chapterName = parsedXML
            .getElementById('ch-' + paramId)
            .getAttribute('name');
        const chapterString =
            paramId + '.' + sectionIndex.toString().padStart(3, '0');
        const matchFound = paramId === chapterString.split('.')[0];

        if (matchFound) {
            const hashId = hash ? hash.split('-')[1] : null;

            jsonArray.push({
                chapterName: chapterName,
                id: chapterString,
                active:
                    fromSidebar && hashId
                        ? sectionIndex === parseInt(hashId)
                        : null,
                href: '/chapter/' + paramId + '#section-' + sectionIndex,
                heading: fromSidebar ? chapterString : null,
                label: $section
            });
        }
    });

    return jsonArray;
};

/**
 * @description Gets one or more breadcrumb links (default, active volume, active title, active chapter or active section).
 * @example
 * getBreadcrumbs('titles', 7, '1010')
 * @param {string} [type] - Optionally accepts a string to determine which element type is wanted.
 * @param {number} [paramId] - Optionally accepts an integer as the id of the wanted volume, title or chapter.
 * @param {string} [hash] - Optionally accepts a string as the id of the wanted section.
 * @returns {string} Returns an array of [hyperlink] objects.
 */

export const getBreadcrumbs = (type, paramId, hash) => {
    let node;
    let jsonArray = [];

    switch (type) {
        case 'titles':
            node = getNode('vol-' + paramId);
            break;
        case 'chapters':
            node = getNode('title-' + paramId);
            break;
        case 'sections':
        case 'chapter':
            node = getNode('ch-' + paramId);
            break;
    }

    if (node) {
        const URL_FRONT_SLASH = '/';
        const CHAR_SPACE = ' ';
        const hashId = hash ? hash.split('-')[1] : paramId ? paramId : '';
        const sectionString =
            paramId + '.' + hashId.toString().padStart(3, '0');

        // VolumeId, TitleId, ChapterId
        do {
            jsonArray.push({
                href: [baseUrl, node.tagName, node.id.split('-')[1]].join(
                    URL_FRONT_SLASH
                ),
                label: [node.tagName, node.id.split('-')[1]].join(CHAR_SPACE)
            });
        } while (
            (node = node.parentNode) !== null &&
            node.parentNode.nodeType !== Node.DOCUMENT_NODE
        );

        // SectionId
        if (hash) {
            jsonArray.unshift({
                href: '/chapter/' + paramId + '#section-' + hashId,
                label: '§ ' + sectionString
            });
        }

        jsonArray = jsonArray.reverse();
    }

    // Default ORS
    jsonArray.unshift({
        href: baseUrl,
        label: 'ORS'
    });

    return jsonArray;
};

/**
 * @description Gets HTML text for a chapter from fetched data from a remote PHP file.
 * @example
 * getBody(7)
 * @param {number} paramId - Accepts an integer as the id of the wanted chapter.
 * @returns {string} Returns HTML text.
 */

export const getBody = async paramId => {
    const url = new Url('https://appdev.ocdla.org/books-online/index.php');

    url.buildQuery('chapter', paramId.toString());

    const client = new HttpClient();
    const req = new Request(url.toString());
    const resp = await client.send(req);
    const msword = await OrsChapter.fromResponse(resp);
    const xml = OrsChapter.toStructuredChapter(msword);

    return xml.toString();
};

/**
 * @description Gets miscellaneous data for a chapter.
 * @example
 * getSidebarSecond(7, '1010')
 * @param {number} paramId - Accepts an integer as the id of the wanted chapter.
 * @returns {string} Returns a miscellaneous array of [hyperlink] objects'.
 */

export const getSidebarSecond = async (paramId, hash) => {
    const hashId = hash ? hash.split('-')[1] : paramId ? paramId : '';
    // prettier-ignore
    const label =
        '§ ' +
        (hash ? paramId + '.' + hashId.toString().padStart(3, '0') : paramId) +
        '\'s source at oregon​.gov';

    return [
        // {
        //     href: '/',
        //     label: 'Current through early 2024'
        // },
        {
            href:
                'https://www.oregonlegislature.gov/bills_laws/ors/ors' +
                paramId +
                '.html',
            label: label
        }
    ];
};
