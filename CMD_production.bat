@ECHO OFF

ECHO ----------------
ECHO 1 - [ production - npm run build ]
ECHO 2 - [ production - build docs ]
ECHO 3 - [ production - npm run serve ]
ECHO 4 - [ production - npm run serve-docs ]
ECHO ----------------

SET /P input="ENTER: "

IF %input% == 1 (
    CALL npm run build
)

IF %input% == 2 (
    @REM Delete "docs" folder if it exists already.
    IF EXIST "%CD%\docs" CALL RMDIR "docs" /S /Q
    CALL npm run jsdoc:build
)

IF %input% == 3 (
    CALL npm run serve
)

IF %input% == 4 (
    CALL npm run serve:docs
)

ECHO ----------------

ECHO FINISHED

PAUSE
