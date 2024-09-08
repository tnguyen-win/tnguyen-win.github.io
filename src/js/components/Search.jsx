/** @jsx vNode */
/* eslint-disable no-unused-vars */
import { vNode } from '@ocdla/view';
import GloabalSearch from '@ocdla/global-components/src/Search';
/* eslint-enable */

export default function Search() {
    return (
        <div class='flex flex-col items-center gap-8 p-4 text-center lg:p-32'>
            <h3 class='text-5xl font-black tracking-tighter'>
                SEARCH THROUGH THE ORS
            </h3>
            <form
                class='flex h-12 w-full justify-center rounded-md bg-red-600 lg:w-2/3'
                onsubmit={e => {
                    e.preventDefault();

                    window.location.pathname = '/toc';
                }}>
                <ul class='flex size-full rounded-md bg-blue-600'>
                    <GloabalSearch placeholder='Search' />
                </ul>
            </form>
        </div>
    );
}
