/** @jsx vNode */ /** @jsxFrag "Fragment" */
/* eslint-disable no-unused-vars */
import { vNode } from '@ocdla/view';
// import Statute from './Statute';
import Entry from './Entry';
/* eslint-enable */

export default function Table_Of_Contents({
    division,
    title,
    subtitle,
    entries = []
}) {
    return (
        <div class='flex flex-col gap-8'>
            <div class='flex flex-col gap-2 p-8 text-center'>
                {title ? (
                    <h3 class='text-5xl font-black tracking-tighter'>
                        {title}
                    </h3>
                ) : (
                    <></>
                )}
                {subtitle ? (
                    <h6 class='text-2xl font-thin'>{subtitle}</h6>
                ) : (
                    <></>
                )}
            </div>
            <ul>
                <li>
                    <h1 class='p-4 text-3xl font-bold'>{division}</h1>
                </li>
                <li>
                    <hr />
                </li>
                <li>
                    <ul class='lg:grid lg:grid-flow-row lg:grid-cols-2 [&>*:nth-child(2n):last-child]:border-b-0 [&>*:nth-child(2n+1):nth-last-child(-n+2)]:border-b-0 [&>*:nth-child(2n+1)]:border-r [&>*]:border-b'>
                        {entries.map(entry => (
                            <Entry {...entry} />
                        ))}
                    </ul>
                </li>
            </ul>
        </div>
    );
}
