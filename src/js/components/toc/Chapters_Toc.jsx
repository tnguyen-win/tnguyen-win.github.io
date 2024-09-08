/** @jsx vNode */
/* eslint-disable no-unused-vars */
import { vNode } from '@ocdla/view';
import Table_Of_Contents from './Table_Of_Contents';
/* eslint-enable */
import { getNode, getChapters } from '../../functions/ors/fetch_data.js';

export default function Chapters_Toc({ division, title }) {
    const _title = 'TITLE ' + title;
    const subtitle = getNode('title-' + title).getAttribute('name');
    const entries = getChapters(title);

    return (
        <Table_Of_Contents
            division={division}
            title={_title}
            subtitle={subtitle}
            entries={entries}
        />
    );
}
