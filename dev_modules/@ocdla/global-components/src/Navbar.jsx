/** @jsx vNode */
/* eslint-disable no-unused-vars */
import { vNode } from '@ocdla/view';
import Logo from './Logo';
import Navlink from './Navlink';
import { DividerMobile, DividerDesktop } from './Dividers';
import Search from './Search';
import Profile from './Profile';
import Button from './Button';
/* eslint-enable */

export default function Navbar() {
    return (
        <nav class='flex flex-col border border-0 border-b lg:h-16 lg:flex-row lg:border lg:border-t-0'>
            <ul class='flex size-full flex-col items-start lg:flex-row lg:items-center'>
                <li class='size-full lg:size-max'>
                    <ul class='flex flex-col items-center lg:flex-row'>
                        <Logo typeNavbar={true} />
                        <Navlink href='https://oregon.public.law/rules'>
                            Oregon Administrative Rules
                        </Navlink>
                        <Navlink
                            // href='https://oregon.public.law/statutes'
                            href='/toc'>
                            Oregon Revised Statutes
                        </Navlink>
                    </ul>
                </li>
                <DividerMobile />
                <li class='size-full lg:ms-auto lg:size-max'>
                    <form
                        class='m-4 flex flex-col items-start lg:m-0 lg:flex-row lg:items-center'
                        onsubmit={e => {
                            e.preventDefault();

                            window.location.pathname = '/';
                        }}>
                        <Search
                            typeNavbar={true}
                            placeholder='Search'
                        />
                        <DividerDesktop />
                        <li class='size-full'>
                            <ul class='flex flex-row-reverse items-center lg:flex-row'>
                                <Profile
                                    bg='bg-[#516490]'
                                    label='G'
                                />
                                <DividerDesktop />
                                <Button
                                    href='/'
                                    label='GIVE FEEDBACK'
                                />
                            </ul>
                        </li>
                    </form>
                </li>
            </ul>
        </nav>
    );
}
