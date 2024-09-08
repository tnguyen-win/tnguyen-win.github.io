/** @jsx vNode */
/* eslint-disable no-unused-vars */
import { vNode } from '@ocdla/view';
import Table_Of_Contents from './Table_Of_Contents';
/* eslint-enable */
import { getVolumes } from '../../functions/ors/fetch_data.js';

export default function Volumes_Toc({ division, title }) {
    const entries = getVolumes();

    return (
        <Table_Of_Contents
            division={division}
            title={title}
            entries={entries}
        />
    );
}
