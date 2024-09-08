/** @jsx vNode */ /** @jsxFrag "Fragment" */
/* eslint-disable no-unused-vars */
import { vNode, useEffect, getResult } from '@ocdla/view';
import Sidebar from '@ocdla/global-components/src/Sidebar';
import SidebarItemLeft from '@ocdla/global-components/src/SidebarItemLeft';
import SidebarItemRight from '@ocdla/global-components/src/SidebarItemRight';
import '../../css/chapter.css';
import Body from '@ocdla/global-components/src/Body';

/* eslint-enable */
import {
    getSections,
    getBody,
    getNode,
    getSidebarSecond
} from '../functions/ors/fetch_data.js';

export default function Chapter({ chapter }) {
    // useEffect assigns a function (to be executed on each render) to a key.
    // The key can be used in getResult(key) to get the result of the function.
    useEffect('theChapter', async () => await getBody(chapter));

    useEffect(
        'sidebarFirst',
        async () => await getSections(chapter, window.location.hash, true)
    );

    useEffect(
        'sidebarSecond',
        async () => await getSidebarSecond(chapter, window.location.hash, true)
    );

    const chapterContents = getResult('theChapter');
    const sidebarFirst = getResult('sidebarFirst');
    const sidebarSecond = getResult('sidebarSecond');
    const title = getNode('ch-' + chapter).getAttribute('name');

    /*
        From React grammar for using innerHTML:

        <div dangerouslySetInnerHTML={
            { __html: htmlContent }
        } />
    */
    return (
        <div class='lg:grid lg:grid-cols-6'>
            <Sidebar sticky={true}>
                {sidebarFirst
                    ? sidebarFirst.map(props => <SidebarItemLeft {...props} />)
                    : null}
            </Sidebar>
            <Body typeOrs={true}>
                {' '}
                <h1 class='text-2xl font-bold'>
                    Chapter {chapter}
                    <br />
                    {title}
                </h1>
                <div dangerouslySetInnerHTML={chapterContents}></div>{' '}
            </Body>
            <Sidebar sticky={true}>
                {/* eslint-disable indent */}
                {sidebarSecond
                    ? sidebarSecond.map(props => (
                          <SidebarItemRight {...props} />
                      ))
                    : null}
                {/* eslint-enable */}
            </Sidebar>
        </div>
    );
}
