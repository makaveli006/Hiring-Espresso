# Fires after Claude edits any file via Edit or Write tool.
#
# - .py files  → ruff lint + pytest
# - .ts/.tsx   → eslint + tsc (type-check only, no emit)
#
# Injects failures back into Claude's context so it can self-correct.

$jsonStr = [Console]::In.ReadToEnd()
$data    = $jsonStr | ConvertFrom-Json
$file    = $data.tool_input.file_path

# ── Python (backend) ──────────────────────────────────────────────────────────
if ($file -match '\.py$') {
    Write-Host "--- ruff check $file ---"
    uv run ruff check $file 2>&1 | Out-Host
    $ruffExit = $LASTEXITCODE

    Write-Host "--- pytest tests/ -q ---"
    $testOut  = uv run pytest tests/ -q 2>&1
    $testOut  | Out-Host
    $testExit = $LASTEXITCODE

    if ($ruffExit -ne 0 -or $testExit -ne 0) {
        @{
            hookSpecificOutput = @{
                hookEventName     = "PostToolUse"
                additionalContext = "Hook: lint or tests failed after editing $file. Ruff exit=$ruffExit, pytest exit=$testExit. Output: $($testOut -join ' | ')"
            }
        } | ConvertTo-Json -Compress
    }
    exit 0
}

# ── TypeScript / TSX (frontend) ───────────────────────────────────────────────
if ($file -match '\.(ts|tsx)$') {
    $frontendDir = "C:\Users\subin\OneDrive\Desktop\Hiring-Espresso\frontend"

    Write-Host "--- eslint $file ---"
    $lintOut  = cmd.exe /c "cd /d `"$frontendDir`" && npm run lint" 2>&1
    $lintExit = $LASTEXITCODE
    $lintOut  | Out-Host

    Write-Host "--- tsc --noEmit ---"
    $tscOut  = cmd.exe /c "cd /d `"$frontendDir`" && npx tsc --noEmit" 2>&1
    $tscExit = $LASTEXITCODE
    $tscOut  | Out-Host

    if ($lintExit -ne 0 -or $tscExit -ne 0) {
        @{
            hookSpecificOutput = @{
                hookEventName     = "PostToolUse"
                additionalContext = "Hook: lint or type-check failed after editing $file. ESLint exit=$lintExit, tsc exit=$tscExit. Output: $($lintOut + $tscOut -join ' | ')"
            }
        } | ConvertTo-Json -Compress
    }
    exit 0
}
