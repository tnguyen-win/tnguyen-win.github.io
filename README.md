# ors-viewer

-   Reader for the Oregon Revised Statutes site.

# Installation

#### Step 1 (Git)

-   Download remote Git repository to your computer.

```
git clone https://github.com/ocdladefense/ors-viewer.git
```

#### `[OPTIONAL]:` Step 2 (Git)

-   Switch the active Git repository branch to another branch.

```
git pull
git checkout [BRANCH]
```

#### Step 3 (Git)

-   Update Git submodules.

```
git pull
git submodule update --init --recursive
```

#### Step 4 (NPM)

-   Installs Node depdencicies.
    -   `[WARNING]:` Don't confuse with `npm install` command.

```
npm update
```

#### Step 5 (NPM)

-   Replace `[BUILD]` or `[WATCH]` with the desired NPM command.

```
npm run [BUILD]
```

**or**

```
npm run [WATCH]
```

#### Step 6 (Visual Studio Code)

-   Set this Git repository as a Visual Studio Code workspace.
    -   This is technically an optional step, but marking this Git repository as a workspace can help improve development productivity in many ways, including visualizing this Git repository's file structure in the top-left [`Explorer`](https://code.visualstudio.com/docs/getstarted/userinterface#_explorer-view) panel of Visual Studio Code. Additionally, all of the following optional steps require setting this Git repository as a Visual Studio Code workspace in order to actually detect files, as well as behave as expected.

#### `[OPTIONAL]:` Step 7 (Visual Studio Code)

-   Install the Prettier plugin: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
    -   For automatic formatting of code on file save, paste or format.

#### `[OPTIONAL]:` Step 8 (Visual Studio Code)

-   Install the ESLint plugin: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
    -   For automatic detecting of code issues; that Prettier may or may not catch or support.

#### `[OPTIONAL]:` Step 9 (Visual Studio Code)

-   Install the Live Server plugin: https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer

    -   For production testing.
    -   `[REQUIRED]:` Please note that in order to use the Live Server extension properly, you MUST open this Git repository inside of Visual Studio Code. [Here](https://www.youtube.com/watch?v=6dDmwwKx8Rc) is a good tutorial if you need more information on how to open a folder inside of Visual Studio Code.
        -   Be aware that OPENING a folder inside of Visual Studio Code is NOT the same as marking a folder as a Visual Studio Code workspace.
        -   If you'd rather not have to keep opening this Git repository inside of your Visual Studio Code, you can also alternatively add the Live Server extension settings that are listed in `.vscode/settings.json` inside of your global Live Serer extension settings.

-   Alternatively, you can also use the already set up, `serve` Node package for production testing.

#### `[OPTIONAL]:` Step 10 (Visual Studio Code)

-   Install the Code Spell Checker plugin: https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker
    -   For automatic grammar checks.

#### `[OPTIONAL]:` Step 11 (Visual Studio Code)

-   Install the Auto Rename Tag plugin: https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag

    -   For automatic creation of non-self-closing tags.

#### `[OPTIONAL]:` Step 12 (Visual Studio Code)

-   Install the XML Tools plugin: https://marketplace.visualstudio.com/items?itemName=DotJoshJohnson.xml
    -   For XML syntax highlighting.

# To-Do

#### Feature

-   Finish dynamic production paths.

    -   Via base path support, etc.
    -   `[TIP]:` See Webpack config `output` key settings (particularly `publicPath` and `path`).

-   Implement search functionality.

    -   **Possible solutions:** Use PHP REST API **or** Salesforce API.

-   Make ORS body headings use default hyperlink theme.

    -   **Possible solutions:** Update the ORS module to import and inject styles from the default hyperlink theme **or** or do the importing and injecting of the styles inside the function that's fetching the ORS body.

-   Setup additional GitHub Workflows to run Prettier (ESLint once it's fixed) and any other formatters or linters, on deployment or workflow trigger.

-   Reimplement app switcher functionality, to allow the toggling between ORS Viewer and Books Online applications.

    -   **Past examples:** Can be found [here](https://github.com/ocdladefense/ors-viewer/blob/4c0ed45cbce65962b723c3852518f41ef3a20175/src/js/App.jsx#L39-L85).

    -   **Possible solutions:** Implement asynchronous functionality for the OCDLA View library.

#### Bug Report

-   Fix body anchors not working as expected due to asynchronous fetching.

    -   **Possible solutions:** create and execute a custom scroll-into-view feature based on the id given by the browser URL.

-   Fix sticky (or fixed) positioning for navbar / header to behave as expected with sidebar(s).

-   Fix ESLint to detect only wanted files from `/src` and `/dev_modules` and maybe `/node_modules`, not all files from all folders.

#### Misc

-   Change currently used default font (`Open Sans`) to something more aesthetically pleasing.

    -   The font choice was originally suggested by another person to help with Dyslexia. Make sure to double-check with Jose before changing the current font though.

    -   `[SUGGESTIONS]:` personally recommended font choices include: `Inter` or `Poppins` or `Roboto` or `Segoe UI`.

-   Make image imports use dynamic imports, if possible.

-   Implement prop structure to allow the stating of a grid size for dynamic grid size functionality (via the Chapter component). For instance to state which sidebars are used or if they are even being used, and depending on that, to pass the correct grid size to TailwindCSS.

-   Restructure the passing of props for the Chapter component to accept props from index.js to allow the passing of top-level variable. For instance for the specifying of which sidebars should be sticky.

# Resources

-   Oregon Revised Statutes (ORS)
    -   (Oregon law) https://oregon.public.law
        -   (ORS) https://oregon.public.law/statutes
    -   (Original source) https://www.oregonlegislature.gov/bills_laws/ors/ors001.html
        -   (CORS workaround) https://appdev.ocdla.org/books-online/index.php?chapter=1
-   Books Online (BON)
    -   (Demo) https://pubs.ocdla.org/fsm/1
    -   (Repository) https://github.com/ocdladefense/books-online
-   JSON
    -   https://codebeautify.org/json-fixer
    -   https://codebeautify.org/remove-empty-lines
-   Visual Studio Code
    -   How to preview Markdown files, natively, in real-time: https://code.visualstudio.com/docs/languages/markdown#_markdown-preview
