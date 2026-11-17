Add-Type -AssemblyName System.Drawing

$src = "C:\Desktop\CodeJunc\WhatsApp Image 2026-11-16 at 10.59.30 AM.jpeg"
$bmp = New-Object System.Drawing.Bitmap($src)

# Bounds: X=175 to 368, Y=334 to 471 (with 2px margin)
$cropX = 175
$cropY = 334
$cropW = 194
$cropH = 138

$target = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Background color
$bgR = 28.0
$bgG = 28.0
$bgB = 28.0

for ($y = 0; $y -lt $cropH; $y++) {
    for ($x = 0; $x -lt $cropW; $x++) {
        $srcX = $cropX + $x
        $srcY = $cropY + $y
        $p = $bmp.GetPixel($srcX, $srcY)

        # Difference from background
        $diff = [Math]::Sqrt([Math]::Pow($p.R - $bgR, 2) + [Math]::Pow($p.G - $bgG, 2) + [Math]::Pow($p.B - $bgB, 2))
        
        # Also check if it's warm (R > G, R > B)
        $isWarm = ($p.R - $p.B)

        if ($diff -lt 12.0 -or $isWarm -lt 8) {
            # Pure background: 100% transparent
            $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } elseif ($diff -lt 40.0) {
            # Transition edge: calculate smooth alpha
            $alpha = [int](($diff - 12.0) / (40.0 - 12.0) * 255.0)
            if ($alpha -gt 255) { $alpha = 255 }
            if ($alpha -lt 0) { $alpha = 0 }
            
            # Unmultiply background (28, 28, 28)
            $aFrac = $alpha / 255.0
            $fgR = [Math]::Min(255, [Math]::Max(0, [int](($p.R - (1.0 - $aFrac) * $bgR) / $aFrac)))
            $fgG = [Math]::Min(255, [Math]::Max(0, [int](($p.G - (1.0 - $aFrac) * $bgG) / $aFrac)))
            $fgB = [Math]::Min(255, [Math]::Max(0, [int](($p.B - (1.0 - $aFrac) * $bgB) / $aFrac)))
            
            $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $fgR, $fgG, $fgB))
        } else {
            # Solid foreground
            $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $p.R, $p.G, $p.B))
        }
    }
}

$outPath = "C:\Desktop\CodeJunc\assets\brand\brand-mark-clean.png"
$target.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$target.Dispose()
$bmp.Dispose()
Write-Host "Created clean transparent brand mark: $outPath"
