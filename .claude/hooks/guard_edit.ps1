# Fires before Claude uses Edit or Write tool.
# Blocks any attempt to write to .env / .env.local / .env.production files.

$jsonStr = [Console]::In.ReadToEnd()
$data    = $jsonStr | ConvertFrom-Json
$file    = $data.tool_input.file_path

if ($file -match '\.env(\.(local|production|development))?$') {
    @{
        continue   = $false
        stopReason = "BLOCKED: Claude cannot edit .env files - they contain live credentials. Edit them manually."
    } | ConvertTo-Json -Compress
    exit 1
}
