@ECHO OFF

ECHO ----------------
ECHO 1 - [ development - npm run watch:ors:dev ]
ECHO 2 - [ development - npm run watch:ors:prod ]
ECHO 3 - [ development - npm run watch:bon:dev ]
ECHO 4 - [ development - npm run watch:bon:prod ]
ECHO 5 - [ development - npm run lint ]
ECHO 6 - [ development - npm run lint:fix ]
ECHO 7 - [ development - depcheck ]
ECHO 8 - [ development - check and install NPM updates ]
ECHO 9 - [ development - publish to NPMJS / global-components ]
ECHO 10 - [ development - publish to NPMJS / routing  ]
ECHO 11 - [ development - npm run git-reset ]
ECHO 12 - [ development - npm run git-force ]
ECHO ----------------

SET /P input="ENTER: "

IF %input% == 1 (
    CALL npm run watch:ors:dev
)

IF %input% == 2 (
    CALL npm run watch:ors:prod
)

IF %input% == 3 (
    CALL npm run watch:bon:dev
)

IF %input% == 4 (
    CALL npm run watch:bon:prod
)

IF %input% == 5 (
    CALL npm run lint
)

IF %input% == 6 (
    CALL npm run lint:fix
)

IF %input% == 7 (
    @REM This Node dependency isn't installed in this Node project (feel free to add it yourself).
    @REM The command below will display any unused Node dependencies.
    @REM Please be aware that this command gives a false positive for **autoprefixer** and **postcss** - those config files are actually required and used.
    CALL depcheck
)

IF %input% == 8 (
    @REM This Node dependency isn't installed in this Node project (feel free to add it yourself).
    @REM "npm update" doesn't update Node dependencies to the latest version - it just installs the dependencies to the versioning described in package.json.
    @REM This is essenially what the first command below fixes, and modifies package.json accordingly to include the latest dependency versions (while still adhering to dependency compatibility).
    CALL ncu -u -t patch
    CALL npm install
)

IF %input% == 9 (
    CALL CD "%CD%\dev_modules\@ocdla\global-components"
    CALL npm publish --access=public
)

IF %input% == 10 (
    CALL CD "%CD%\dev_modules\@ocdla\routing"
    CALL npm publish --access=public
)

IF %input% == 11 (
    @REM Please be careful with this command. It will remove the last commit for this local Git repository.
    CALL npm run git:reset
)

IF %input% == 12 (
    @REM Please be careful with this command. It will forcefully sync your local Git repository's commits with your remote Git repository.
    CALL npm run git:force
)

ECHO ----------------

ECHO FINISHED

PAUSE
