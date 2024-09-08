/** @jsx vNode */
/* eslint-disable-next-line no-unused-vars */
import { vNode } from '@ocdla/view';

export default function Body({ typeOrs, children }) {
    return (
        /* prettier-ignore */
        <section
            id='body'
            class={`${typeOrs ? '[&_*]:mb-4 ' : ''}flex w-full flex-col gap-4 p-4 lg:col-span-4 lg:col-start-2 lg:me-auto lg:border-x lg:p-8`}>
            {children}
        </section>
    );
}
