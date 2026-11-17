Add-Type -AssemblyName System.Drawing

$src = "C:\Desktop\CodeJunc\WhatsApp Image 2026-11-16 at 10.59.30 AM.jpeg"
$bmp = New-Object System.Drawing.Bitmap($src)

$cropX = 175
$cropY = 334
$cropW = 194
$cropH = 138

$target = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bgR = 28.0; $bgG = 28.0; $bgB = 28.0

for ($y = 0; $y -lt $cropH; $y++) {
    for ($x = 0; $x -lt $cropW; $x++) {
        $p = $bmp.GetPixel($cropX + $x, $cropY + $y)
        $diff = [Math]::Sqrt([Math]::Pow($p.R - $bgR, 2) + [Math]::Pow($p.G - $bgG, 2) + [Math]::Pow($p.B - $bgB, 2))
        
        if ($diff -lt 16.0 -or $p.R -lt 45) {
            $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } elseif ($diff -lt 48.0) {
            $aFrac = ($diff - 16.0) / (48.0 - 16.0)
            if ($aFrac -lt 0.05) {
                $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                continue
            }
            $alpha = [int]($aFrac * 255.0)
            if ($alpha -gt 255) { $alpha = 255 }
            
            $fgR = [Math]::Min(255, [Math]::Max(0, [int](($p.R - (1.0 - $aFrac) * $bgR) / $aFrac)))
            $fgG = [Math]::Min(255, [Math]::Max(0, [int](($p.G - (1.0 - $aFrac) * $bgG) / $aFrac)))
            $fgB = [Math]::Min(255, [Math]::Max(0, [int](($p.B - (1.0 - $aFrac) * $bgB) / $aFrac)))
            $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $fgR, $fgG, $fgB))
        } else {
            $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $p.R, $p.G, $p.B))
        }
    }
}

$target.Save("C:\Desktop\CodeJunc\assets\brand\brand-mark-transparent.png", [System.Drawing.Imaging.ImageFormat]::Png)
$target.Dispose()
$bmp.Dispose()
Write-Host "Created brand-mark-transparent.png successfully."
