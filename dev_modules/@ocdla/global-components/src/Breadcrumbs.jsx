/** @jsx vNode */ /** @jsxFrag "Fragment" */
/* eslint-disable no-unused-vars */
import { vNode } from '@ocdla/view';
import BreadcrumbItem from './BreadcrumbItem';
/* eslint-enable */

export default function Breadcrumbs({ crumbs = [] }) {
    return (
        <section class='flex items-center border border-t-0 p-4 capitalize text-black lg:h-16'>
            <ul class='flex flex-wrap items-center whitespace-pre'>
                {crumbs.map((crumb, i) => {
                    const seperatorString =
                        i !== crumbs.length - 1 ? ' / ' : ' ';

                    return (
                        <>
                            <BreadcrumbItem {...crumb} />
                            {seperatorString}
                        </>
                    );
                })}
            </ul>
        </section>
    );
}
