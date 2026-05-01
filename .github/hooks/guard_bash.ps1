# Fires before Claude runs any Bash/PowerShell command.
# Blocks: (1) commands that write to .env files  (2) git push

$jsonStr = [Console]::In.ReadToEnd()
$data    = $jsonStr | ConvertFrom-Json
$cmd     = $data.tool_input.command

# Block writes to .env / .env.local / .env.production files
if ($cmd -match '\.env(\.(local|production|development))?$' -and
    ($cmd -match '>|echo|copy|move|Set-Content|Out-File|tee|write')) {
    @{
        continue   = $false
        stopReason = "BLOCKED: Command writes to an .env file which holds live credentials. Edit it manually if needed."
    } | ConvertTo-Json -Compress
    exit 1
}

# Block git push (must be run manually)
if ($cmd -match '\bgit\s+push\b') {
    @{
        continue   = $false
        stopReason = "BLOCKED: git push must be run manually from your terminal - not by Claude."
    } | ConvertTo-Json -Compress
    exit 1
}
