/** @jsx vNode */
/* eslint-disable no-unused-vars */
import { vNode } from '@ocdla/view';

export default function Sidebar({ children, id, sticky = false }) {
    return (
        /* prettier-ignore */
        <aside
            id={id || null}
            class={`${sticky ? 'lg:sticky lg:top-0 ' : ''}hidden h-[87.5vh] list-none overflow-y-scroll lg:block`}>
            {children}
        </aside>
    );
}
