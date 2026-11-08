$ErrorActionPreference = 'Stop'
$root = Join-Path $env:RUNNER_TEMP 'plunibio-input-poc'
$results = Join-Path $root 'results'
$workspace = Join-Path $root 'workspace'
New-Item -ItemType Directory -Force $results, $workspace | Out-Null
Start-Transcript -Path (Join-Path $results 'windows.log')

function Get-OneFile([string]$Pattern) {
    $files = @(Get-ChildItem -Path $Pattern -File)
    if ($files.Count -ne 1) { throw "Expected one file matching $Pattern; found $($files.Count)" }
    return $files[0].FullName
}

function Run-Installer([string]$Executable, [string[]]$Arguments) {
    $process = Start-Process -FilePath $Executable -ArgumentList $Arguments -Wait -PassThru
    if ($process.ExitCode -ne 0) { throw "$Executable failed with exit code $($process.ExitCode)" }
}

function Save-Screenshot([string]$Name) {
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    $bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
    $bitmap = [System.Drawing.Bitmap]::new($bounds.Width, $bounds.Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
        $bitmap.Save((Join-Path $results $Name), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $graphics.Dispose(); $bitmap.Dispose() }
}

function Wait-AppEvent([string]$LogPath, [System.Diagnostics.Process]$Process, [string]$Event, [string[]]$Details = @()) {
    for ($i = 0; $i -lt 60; $i++) {
        $matching = @()
        if (Test-Path $LogPath) {
            $matching = @(Select-String -Path $LogPath -SimpleMatch $Event | Where-Object {
                $line = $_.Line
                @($Details | Where-Object { !$line.Contains($_) }).Count -eq 0
            })
        }
        if ($matching.Count -gt 0) {
            Write-Host "Verified event: $Event"
            return
        }
        $Process.Refresh()
        if ($Process.HasExited) { throw "Application exited while waiting for $Event" }
        Start-Sleep -Seconds 1
    }
    throw "Timed out waiting for $Event"
}

function Find-Installation {
    $roots = @(
        (Join-Path $env:LOCALAPPDATA 'Plunibio'),
        (Join-Path $env:LOCALAPPDATA 'Programs\Plunibio'),
        (Join-Path $env:ProgramFiles 'Plunibio'),
        (Join-Path ${env:ProgramFiles(x86)} 'Plunibio')
    ) | Where-Object { Test-Path $_ }
    $found = @(foreach ($base in $roots) {
        Get-ChildItem -Path $base -Filter plunibio.exe -File -Recurse -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -notlike "$env:GITHUB_WORKSPACE*" }
    })
    if ($found.Count -ne 1) { throw "Expected one installed executable; found $($found.Count)" }
    return $found[0].FullName
}

try {
    $nsis = Get-OneFile 'src-tauri/target/release/bundle/nsis/*-setup.exe'
    $msi = Get-OneFile 'src-tauri/target/release/bundle/msi/*.msi'
    Write-Host 'Installing NSIS package'
    Run-Installer $nsis @('/S')
    $exe = Find-Installation
    $uninstaller = Join-Path (Split-Path $exe) 'uninstall.exe'
    if (!(Test-Path $uninstaller)) { throw "NSIS uninstaller missing: $uninstaller" }
    Run-Installer $uninstaller @('/S')
    if (Test-Path $exe) { throw 'NSIS application still exists after uninstall' }

    Write-Host 'Installing MSI package'
    Run-Installer 'msiexec.exe' @('/i', "`"$msi`"", '/qn', '/norestart', '/l*v', "`"$results\msi-install.log`"")
    $exe = Find-Installation
    $stdout = Join-Path $results 'application.log'
    $stderr = Join-Path $results 'application-error.log'
    $file = Join-Path $workspace 'smoke.md'
    if (Test-Path $file) { throw 'Workspace is not empty before the creation test' }
    $env:RUST_LOG = 'debug'
    $app = Start-Process -FilePath $exe -ArgumentList @('--base-path', "`"$workspace`"", '--width', '850', '--height', '700') -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
    try {
        $shell = New-Object -ComObject WScript.Shell
        $activated = $false
        for ($i = 0; $i -lt 60; $i++) {
            $app.Refresh()
            if ($app.HasExited) { throw 'Application exited before workspace opened' }
            if ($app.MainWindowHandle -ne [IntPtr]::Zero -and $shell.AppActivate($app.Id)) { $activated = $true; break }
            Start-Sleep -Seconds 1
        }
        if (!$activated) { throw 'Could not activate workspace window' }
        Wait-AppEvent $stdout $app 'lifecycle_event=app.started'
        Wait-AppEvent $stdout $app 'frontend_event=workspace.ready'
        Write-Host 'Creating Markdown in the workspace'
        $shell.SendKeys('^+m')
        Wait-AppEvent $stdout $app 'frontend_event=entry_dialog.opened;' @('"kind":"markdown"')
        # The dialog contains .md with the caret before the extension.
        $shell.SendKeys('smoke')
        $shell.SendKeys('{ENTER}')
        Wait-AppEvent $stdout $app 'frontend_event=entry.created;' @('"kind":"markdown"')
        Wait-AppEvent $stdout $app 'frontend_event=editor.focused;' @('"editor":"EditorMarkdown"', '"connected":true', '"focused":true')
        if (!(Test-Path $file)) { throw 'Markdown file was not created' }
        if (!$shell.AppActivate($app.Id)) { throw 'Could not activate application window' }
        Start-Sleep -Seconds 2
        $shell.SendKeys('Plunibio smoke test')
        Start-Sleep -Seconds 1
        Save-Screenshot 'screen.png'
        Wait-AppEvent $stdout $app 'frontend_event=editor.changed;' @('"editor":"EditorMarkdown"', '"state":"ready"')
        $shell.SendKeys('^s')
        Wait-AppEvent $stdout $app 'frontend_event=editor.saved;' @('"editor":"EditorMarkdown"')
        for ($i = 0; $i -lt 20; $i++) {
            if ((Test-Path $file) -and (Get-Content -Raw $file).Contains('Plunibio smoke test')) { break }
            Start-Sleep -Seconds 1
        }
        if (Test-Path $file) { Copy-Item $file (Join-Path $results 'smoke.md') }
        if (!(Test-Path $file) -or !(Get-Content -Raw $file).Contains('Plunibio smoke test')) { throw 'Expected text was not saved' }
        Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class SmokeNative {
    [StructLayout(LayoutKind.Sequential)] public struct Rect { public int Left, Top, Right, Bottom; }
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hwnd, out Rect rect);
    [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, UIntPtr extra);
}
'@
        $app.Refresh()
        $rect = [SmokeNative+Rect]::new()
        if (![SmokeNative]::GetWindowRect($app.MainWindowHandle, [ref]$rect)) { throw 'Could not get window bounds' }
        [SmokeNative]::SetCursorPos($rect.Right - 26, $rect.Top + 53) | Out-Null
        [SmokeNative]::mouse_event(2, 0, 0, 0, [UIntPtr]::Zero)
        [SmokeNative]::mouse_event(4, 0, 0, 0, [UIntPtr]::Zero)
        Start-Sleep -Seconds 1
        $shell.SendKeys('{ESC}')
        $shell.SendKeys(' ')
        Start-Sleep -Seconds 1
        $shell.SendKeys('{END}{ENTER}')
        Start-Sleep -Seconds 1
        Save-Screenshot 'about.png'
        Wait-AppEvent $stdout $app 'frontend_event=about.opened'
        $expectedVersion = (Get-Content 'package.json' -Raw | ConvertFrom-Json).version
        Wait-AppEvent $stdout $app 'frontend_event=about.metadata;' @("`"version`":`"$expectedVersion`"")
        Save-Screenshot 'about.png'
        $shell.SendKeys('{ESC}')
        Wait-AppEvent $stdout $app 'frontend_event=about.closed'
        if (!$app.CloseMainWindow()) { throw 'Could not request normal window close' }
        if (!$app.WaitForExit(15000)) { throw 'Application did not close' }
        if (!(Select-String -Path $stdout -SimpleMatch 'lifecycle_event=app.window.closed' -Quiet)) { throw 'Application window closure was not logged' }
    } catch {
        try { Save-Screenshot 'failure.png' } catch { Write-Warning "Could not capture screen after failure: $_" }
        throw
    } finally {
        if (!$app.HasExited) { Stop-Process -Id $app.Id -Force -ErrorAction SilentlyContinue }
    }
    Run-Installer 'msiexec.exe' @('/x', "`"$msi`"", '/qn', '/norestart', '/l*v', "`"$results\msi-uninstall.log`"")
    if (Test-Path $exe) { throw 'MSI application still exists after uninstall' }
    Write-Host 'Windows packages and MSI input verified.'
} finally { Stop-Transcript }
