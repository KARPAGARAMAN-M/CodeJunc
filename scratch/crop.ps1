Add-Type -AssemblyName System.Drawing

$src = "C:\Desktop\CodeJunc\WhatsApp Image 2026-11-16 at 10.59.30 AM.jpeg"
$bmp = New-Object System.Drawing.Bitmap($src)
$dir = "C:\Desktop\CodeJunc\assets\brand"

function Do-Crop($x, $y, $w, $h, $name) {
    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $target = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($target)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $g.DrawImage($bmp, $destRect, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $outPath = Join-Path $dir $name
    $target.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $target.Dispose()
    Write-Host "Saved: $outPath ($w x $h)"
}

# 1. Primary Logo Dark:
# In 1024x572: x=75, y=110, w=390, h=95
Do-Crop 75 110 395 90 "logo-dark.png"

# 2. Primary Logo Light:
# In 1024x572: x=565, y=110, w=390, h=95
Do-Crop 565 110 395 90 "logo-light.png"

# 3. CJ Brand Mark alone (clean, without caption):
# x=170, y=320, w=205, h=155
Do-Crop 170 320 205 155 "brand-mark.png"

# 4. App Icon alone:
# x=788, y=348, w=115, h=115
Do-Crop 788 348 115 115 "app-icon.png"

# 5. Browser Mockup Icon:
# x=590, y=348, w=155, h=115
Do-Crop 590 348 155 115 "browser-icon.png"

$bmp.Dispose()
Write-Host "Done!"
