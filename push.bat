@echo off
echo [Resonance] Initiating Auto-Push to GitHub...

:: Initialize git if it has not been done
if not exist ".git" (
    git init
    git remote add origin https://github.com/venky11-social/resonance.git
) else (
    :: Ensure the remote is correct
    git remote set-url origin https://github.com/venky11-social/resonance.git
)

:: Add all files, commit, and push
git add .
git commit -m "Auto-Commit: resonance player UI and performance updates"
git push -u origin main

echo.
echo [Resonance] Successfully pushed updates to https://github.com/venky11-social/resonance.git!
pause
