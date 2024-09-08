/** @jsx vNode */
/* eslint-disable no-unused-vars */
import { vNode } from '@ocdla/view';
import Link from './Defaults';
/* eslint-enable */

export default function BreadcrumbItem({ href, label }) {
    return (
        <li>
            <Link href={href}>{label}</Link>
        </li>
    );
}
