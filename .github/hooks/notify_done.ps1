# Fires when Claude finishes its turn (Stop event).
# Shows a Windows popup that auto-dismisses after 4 seconds.
# Falls back to a beep if WScript is unavailable.

try {
    $ws = New-Object -ComObject WScript.Shell
    $ws.Popup("Claude Code task complete!", 4, "Claude Code", 64) | Out-Null
} catch {
    [Console]::Beep(800, 300)
    [Console]::Beep(1000, 300)
}
