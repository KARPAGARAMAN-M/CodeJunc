Add-Type -AssemblyName System.Drawing

$src = "C:\Desktop\CodeJunc\WhatsApp Image 2026-11-16 at 10.59.30 AM.jpeg"
$bmp = New-Object System.Drawing.Bitmap($src)

Write-Host "Total size: $($bmp.Width) x $($bmp.Height)"

# 1. Inspect Brand Mark (around x: 170-380, y: 320-470)
# Find bounding box where pixel differs from background RGB(28,28,28)
$minX = 9999; $maxX = 0; $minY = 9999; $maxY = 0
for ($y = 320; $y -lt 480; $y++) {
    for ($x = 160; $x -lt 380; $x++) {
        $p = $bmp.GetPixel($x, $y)
        # Background is around 28, 28, 28
        $diff = [Math]::Sqrt([Math]::Pow($p.R - 28, 2) + [Math]::Pow($p.G - 28, 2) + [Math]::Pow($p.B - 28, 2))
        if ($diff -gt 30) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Host "Brand mark artwork bounds: X=$minX..$maxX (W=$($maxX-$minX+1)), Y=$minY..$maxY (H=$($maxY-$minY+1))"

# 2. Inspect Logo Dark (in upper left, around x: 70-470, y: 100-200)
$minX = 9999; $maxX = 0; $minY = 9999; $maxY = 0
for ($y = 90; $y -lt 210; $y++) {
    for ($x = 60; $x -lt 480; $x++) {
        $p = $bmp.GetPixel($x, $y)
        $diff = [Math]::Sqrt([Math]::Pow($p.R - 28, 2) + [Math]::Pow($p.G - 28, 2) + [Math]::Pow($p.B - 28, 2))
        if ($diff -gt 30) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Host "Logo Dark artwork bounds: X=$minX..$maxX (W=$($maxX-$minX+1)), Y=$minY..$maxY (H=$($maxY-$minY+1))"

# 3. Inspect Logo Light (in upper right, around x: 550-960, y: 100-200)
$minX = 9999; $maxX = 0; $minY = 9999; $maxY = 0
for ($y = 90; $y -lt 210; $y++) {
    for ($x = 550; $x -lt 960; $x++) {
        $p = $bmp.GetPixel($x, $y)
        # Background is cream/light around 246, 243, 236
        $diff = [Math]::Sqrt([Math]::Pow($p.R - 246, 2) + [Math]::Pow($p.G - 243, 2) + [Math]::Pow($p.B - 236, 2))
        if ($diff -gt 30) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Host "Logo Light artwork bounds: X=$minX..$maxX (W=$($maxX-$minX+1)), Y=$minY..$maxY (H=$($maxY-$minY+1))"

$bmp.Dispose()
