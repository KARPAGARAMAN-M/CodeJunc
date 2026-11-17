Add-Type -AssemblyName System.Drawing

$dir = "C:\Desktop\CodeJunc\assets\brand"
$appIcon = [System.Drawing.Bitmap]::FromFile("$dir\app-icon.png")

function Resize-Icon($w, $h, $name) {
    $target = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($target)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $srcRect = New-Object System.Drawing.Rectangle(0, 0, $appIcon.Width, $appIcon.Height)
    $g.DrawImage($appIcon, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $target.Save("$dir\$name", [System.Drawing.Imaging.ImageFormat]::Png)
    $target.Dispose()
    Write-Host "Created $name ($w x $h)"
}

Resize-Icon 32 32 "favicon-32x32.png"
Resize-Icon 16 16 "favicon-16x16.png"
Resize-Icon 180 180 "apple-touch-icon.png"
Resize-Icon 192 192 "icon-192.png"
Resize-Icon 512 512 "icon-512.png"

$appIcon.Dispose()
Write-Host "All icons created."
