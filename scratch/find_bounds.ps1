Add-Type -AssemblyName System.Drawing

$src = "C:\Desktop\CodeJunc\WhatsApp Image 2026-11-16 at 10.59.30 AM.jpeg"
$bmp = New-Object System.Drawing.Bitmap($src)

# Bottom-left quadrant: x from 50 to 480, y from 300 to 510
$minX = 480; $maxX = 50
$minY = 510; $maxY = 300

for ($y = 300; $y -lt 510; $y++) {
    for ($x = 50; $x -lt 480; $x++) {
        $p = $bmp.GetPixel($x, $y)
        # If pixel is significantly brighter or warmer than background (28, 28, 28)
        if ($p.R -gt 60 -and $p.R -gt $p.B + 20) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Brand mark bounds in source image: X=$minX to $maxX, Y=$minY to $maxY"
Write-Host "Width = $($maxX - $minX + 1), Height = $($maxY - $minY + 1)"

$bmp.Dispose()
