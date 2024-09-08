/** @jsx vNode */
/* eslint-disable-next-line no-unused-vars */
import { vNode } from '@ocdla/view';

export default function SidebarItemLeft({ active, href, heading, label, id }) {
    let a = 'group hover:bg-neutral-100';
    let h = 'text-blue-400 group-hover:text-blue-500 ';
    let p = '';

    if (active) {
        a = 'text-white border-black bg-black';
        h = '';
        p = 'text-white';
    }

    return (
        <li>
            <a
                id={id || null}
                class={`${a} flex flex-col gap-2 border-b px-4 py-2`}
                href={href}>
                <h1 class={`${h}font-bold`}>{heading}</h1>
                <p class={p}>{label}</p>
            </a>
        </li>
    );
}
