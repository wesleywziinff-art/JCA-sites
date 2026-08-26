# Local static preview server for the JCA site.
# Only needed because Node is not installed on this machine — once it is,
# `npx serve .` does the same job. Usage:
#
#   powershell -ExecutionPolicy Bypass -File serve.ps1
#
# Then open http://localhost:8080/ . Press Ctrl+C to stop.

param(
  [int]$Port = 8080
)

$root = $PSScriptRoot
$prefix = "http://localhost:$Port/"

$types = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".webp" = "image/webp"
  ".avif" = "image/avif"
  ".ico"  = "image/x-icon"
  ".json" = "application/json"
  ".woff2" = "font/woff2"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Serving $root at $prefix (Ctrl+C to stop)"

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $path = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($path)) { $path = "index.html" }

    $full = Join-Path $root ($path -replace '/', '\')

    # Clean URLs: /about resolves to about.html, matching Vercel's behavior.
    if (-not (Test-Path $full) -and (Test-Path "$full.html" -PathType Leaf)) {
      $full = "$full.html"
    }
    if (Test-Path $full -PathType Container) { $full = Join-Path $full "index.html" }

    if (Test-Path $full -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($full).ToLower()
      $ct = $types[$ext]
      if (-not $ct) { $ct = "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($full)
      $ctx.Response.ContentType = $ct
      $ctx.Response.StatusCode = 200
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found - $path")
      $ctx.Response.StatusCode = 404
      $ctx.Response.ContentType = "text/plain; charset=utf-8"
      $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $ctx.Response.OutputStream.Close()
  } catch {
    # Ignore per-request failures and keep serving.
  }
}
