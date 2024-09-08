/** @jsx vNode */ /** @jsxFrag "Fragment" */
/* eslint-disable no-unused-vars */
import { vNode } from '@ocdla/view';
import Link from '@ocdla/global-components/src/Defaults';
/* eslint-enable */

export default function Entry({ href, id, heading, label }) {
    return (
        <li class='size-full'>
            <a
                class='flex size-full p-4 hover:bg-neutral-100'
                href={href}>
                <ul class='flex gap-4'>
                    <li>
                        <Link
                            href={href}
                            extraClasses={'font-bold'}>
                            {id}
                        </Link>
                    </li>
                    <li>
                        <ul class='flex flex-col gap-2'>
                            {heading ? (
                                <li>
                                    <h1 class='font-bold'>{heading}</h1>
                                </li>
                            ) : (
                                <></>
                            )}
                            {label ? (
                                <li>
                                    <p class='text-neutral-500'>{label}</p>
                                </li>
                            ) : (
                                <></>
                            )}
                        </ul>
                    </li>
                </ul>
            </a>
        </li>
    );
}
