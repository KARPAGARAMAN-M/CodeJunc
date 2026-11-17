Add-Type -AssemblyName System.Drawing

$src = "C:\Desktop\CodeJunc\WhatsApp Image 2026-11-16 at 10.59.30 AM.jpeg"
$bmp = New-Object System.Drawing.Bitmap($src)
$dir = "C:\Desktop\CodeJunc\assets\brand"

# Crop CJ Mark from the light logo (x=565, y=110, w=125, h=90)
$rect = New-Object System.Drawing.Rectangle(565, 110, 125, 90)
$target = New-Object System.Drawing.Bitmap(125, 90)
$g = [System.Drawing.Graphics]::FromImage($target)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$destRect = New-Object System.Drawing.Rectangle(0, 0, 125, 90)
$g.DrawImage($bmp, $destRect, $rect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

# Make background pure white for multiply
$w = 125
$h = 90
$lightDst = New-Object System.Drawing.Bitmap($w, $h)
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $p = $target.GetPixel($x, $y)
        $r = [Math]::Min(255, [int]($p.R * 255.0 / 240.0))
        $g = [Math]::Min(255, [int]($p.G * 255.0 / 238.0))
        $b = [Math]::Min(255, [int]($p.B * 255.0 / 232.0))
        $lightDst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
    }
}
$lightDst.Save("$dir\brand-mark-light-blend.png", [System.Drawing.Imaging.ImageFormat]::Png)
$lightDst.Dispose()
$target.Dispose()
$bmp.Dispose()
Write-Host "Created brand-mark-light-blend.png"
