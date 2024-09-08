/**
 * @fileoverview This file is the meat-and-potatoes of the ORS Viewer application and contains the general layout.
 */

/** @jsx vNode */ /** @jsxFrag "Fragment" */
/* eslint-disable no-unused-vars */
import { vNode } from '@ocdla/view';
import Navbar from '@ocdla/global-components/src/Navbar';
import Breadcrumbs from '@ocdla/global-components/src/Breadcrumbs';
// import NotFound from '@ocdla/global-components/src/NotFound';
import Footer from '@ocdla/global-components/src/Footer';
/* eslint-enable */

export default function App({
    headerPinned,
    // error,
    breadcrumbs,
    children
    // layout
}) {
    // There is a component that can be used to render a nice 404 error.
    // return <NotFound />;

    return (
        <>
            <header
                /* prettier-ignore */
                class={`${headerPinned ? 'sticky top-0 ' : ''}container mx-auto flex w-full flex-col bg-white lg:h-32`}>
                <Navbar />
                <Breadcrumbs crumbs={breadcrumbs} />
            </header>
            {/* <Main cols='3' /> */}
            <main class='container mx-auto border-x'>{children}</main>
            <Footer
                showFacebook={true}
                showTwitter={true}
                showYouTube={true}
                useGoogleMapsIFrame={true}
            />
        </>
    );
}
