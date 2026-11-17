Add-Type -AssemblyName System.Drawing

$dir = "C:\Desktop\CodeJunc\assets\brand"

# 1. Dark Logo -> black background for screen blending
$darkSrc = [System.Drawing.Bitmap]::FromFile("$dir\logo-dark.png")
$darkDst = New-Object System.Drawing.Bitmap($darkSrc.Width, $darkSrc.Height)
$w = $darkSrc.Width
$h = $darkSrc.Height

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $p = $darkSrc.GetPixel($x, $y)
        # Background is around (29, 29, 27). Max component ~ 34.
        $r = [Math]::Max(0, [int]($p.R - 30))
        $g = [Math]::Max(0, [int]($p.G - 30))
        $b = [Math]::Max(0, [int]($p.B - 30))
        # Stretch back up
        $r = [Math]::Min(255, [int]($r * 255.0 / 225.0))
        $g = [Math]::Min(255, [int]($g * 255.0 / 225.0))
        $b = [Math]::Min(255, [int]($b * 255.0 / 225.0))
        $darkDst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
    }
}
$darkDst.Save("$dir\logo-dark-blend.png", [System.Drawing.Imaging.ImageFormat]::Png)
$darkSrc.Dispose()
$darkDst.Dispose()
Write-Host "Saved logo-dark-blend.png"

# 2. Light Logo -> pure white background for multiply blending
$lightSrc = [System.Drawing.Bitmap]::FromFile("$dir\logo-light.png")
$lightDst = New-Object System.Drawing.Bitmap($lightSrc.Width, $lightSrc.Height)
$w = $lightSrc.Width
$h = $lightSrc.Height

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $p = $lightSrc.GetPixel($x, $y)
        # Background is around (246, 243, 236). Min component ~ 230.
        $r = [Math]::Min(255, [int]($p.R * 255.0 / 240.0))
        $g = [Math]::Min(255, [int]($p.G * 255.0 / 238.0))
        $b = [Math]::Min(255, [int]($p.B * 255.0 / 232.0))
        $lightDst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
    }
}
$lightDst.Save("$dir\logo-light-blend.png", [System.Drawing.Imaging.ImageFormat]::Png)
$lightSrc.Dispose()
$lightDst.Dispose()
Write-Host "Saved logo-light-blend.png"

# 3. Brand Mark alone -> black background for screen blending & dark surfaces
$bmSrc = [System.Drawing.Bitmap]::FromFile("$dir\brand-mark.png")
$bmDst = New-Object System.Drawing.Bitmap($bmSrc.Width, $bmSrc.Height)
$w = $bmSrc.Width
$h = $bmSrc.Height

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $p = $bmSrc.GetPixel($x, $y)
        $r = [Math]::Max(0, [int]($p.R - 30))
        $g = [Math]::Max(0, [int]($p.G - 30))
        $b = [Math]::Max(0, [int]($p.B - 30))
        $r = [Math]::Min(255, [int]($r * 255.0 / 225.0))
        $g = [Math]::Min(255, [int]($g * 255.0 / 225.0))
        $b = [Math]::Min(255, [int]($b * 255.0 / 225.0))
        $bmDst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
    }
}
$bmDst.Save("$dir\brand-mark-blend.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmSrc.Dispose()
$bmDst.Dispose()
Write-Host "Saved brand-mark-blend.png"
