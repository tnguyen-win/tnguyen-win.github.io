/**
 * @fileoverview This file checks whether the ORS Viewer application is being hosted locally or remotely (basically CORS checks) to return appropriate data accordingly.
 */

import HttpMock from '@ocdla/lib-http/HttpMock';
import Url from '@ocdla/lib-http/Url';
import volumes from '../../data/xml/ors_viewer/statutes.xml';
/* eslint-disable no-unused-vars */
import Link from '@ocdla/global-components/src/Defaults';
/* eslint-enable */

export default class OrsMock extends HttpMock {
    constructor() {
        super();
    }

    getResponse(req) {
        const url = new Url(req.url);
        const id = url.getPath();

        /* eslint-disable indent */
        // Synesthetic responses.
        return id.includes('index')
            ? new Response(volumes, {
                  headers: { 'Content-Type': 'application/xml' }
              })
            : new Response(this.imports[id]);
        /* eslint-enable */
    }

    // Left over code from the app switcher functionality for Books Online.
    getMock() {
        // console.log('getBody: (b)');
        const styleTabActive =
            'tab-btn rounded-t-md border border-b-transparent p-4';
        const styleTabInactive =
            'tab-btn rounded-t-md border border-transparent border-b-inherit p-4 text-blue-400 hover:text-blue-500 hover:underline hover:underline-offset-2';
        const toggleTabs = tabBtnClicked => {
            const tabBtns = document.getElementsByClassName('tab-btn');
            const tabBodies = document.getElementsByClassName('tab-body');

            Array.from(tabBtns).forEach($tabBtn => {
                $tabBtn.className =
                    tabBtnClicked.target === $tabBtn
                        ? styleTabActive
                        : styleTabInactive;
            });

            Array.from(tabBodies).forEach($tabBody =>
                tabBtnClicked.target.id.split('-')[2] ===
                $tabBody.id.split('-')[2]
                    ? $tabBody.classList.remove('hidden')
                    : $tabBody.classList.add('hidden')
            );
        };

        return (
            <>
                <div class='mb-4'>
                    <h3 class='text-5xl font-black tracking-tighter'>
                        ORS 1.001
                    </h3>
                    <h6 class='text-2xl font-thin'>State policy for courts</h6>
                </div>
                <div class='flex flex-col gap-4'>
                    <ul class='flex'>
                        <li>
                            <button
                                id='tab-btn-1'
                                class={styleTabActive}
                                onclick={toggleTabs}>
                                Text
                            </button>
                        </li>
                        <li>
                            <button
                                id='tab-btn-2'
                                class={styleTabInactive}
                                onclick={toggleTabs}>
                                Annotations
                            </button>
                        </li>
                        <li class='w-full border border-transparent border-b-inherit p-4'>
                            &nbsp;
                        </li>
                    </ul>
                </div>
                <p
                    id='tab-body-1'
                    class='tab-body flex flex-col gap-4'>
                    The Legislative Assembly hereby declares that, as a matter
                    of statewide concern, it is in the best interests of the
                    people of this state that the judicial branch of state
                    government, including the appellate, tax and circuit courts,
                    be funded and operated at the state level. The Legislative
                    Assembly finds that state funding and operation of the
                    judicial branch can provide for best statewide allocation of
                    governmental resources according to the actual needs of the
                    people and of the judicial branch by establishing an
                    accountable, equitably funded and uniformly administered
                    system of justice for all the people of this state. [1981
                    s.s. c.3 §1]
                    <hr />
                    <small>
                        <i>
                            Source: Section 1.001 — State policy for courts,{' '}
                            <Link href='https://­oregonlegislature.­gov/bills_laws/ors/ors001.­html'>
                                https://­oregonlegislature.­gov/bills_laws/ors/ors001.­html
                            </Link>
                        </i>
                    </small>
                </p>
                <p
                    id='tab-body-2'
                    class='tab-body flex hidden flex-col gap-4'>
                    <p>Law Review Citations</p>
                    <p>50 WLR 291 (2014)</p>
                </p>
            </>
        );
    }
}
