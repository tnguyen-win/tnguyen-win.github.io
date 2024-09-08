/** @jsx vNode */ /** @jsxFrag "Fragment" */
/* eslint-disable no-unused-vars */
import { vNode } from '@ocdla/view';
import Link from './Defaults';
/* eslint-enable */

export default function Outline({ children }) {
    return (
        <aside class='sticky top-0 hidden h-[87.5vh] overflow-y-scroll lg:block'>
            {recursiveRender(children)}
        </aside>
    );
}

function recursiveRender(children) {
    return (
        <ul class='ml-4 border-l'>
            {children.map(child => {
                return (
                    <li>
                        <Link
                            extraClasses='flex px-4 py-2'
                            href={'#' + child.href}
                            label={child.content}
                            id={child.href + '-outline-item'}>
                            {child.content}
                        </Link>
                        {child.children.length > 0
                            ? recursiveRender(child.children)
                            : ''}
                    </li>
                );
            })}
        </ul>
    );
}
