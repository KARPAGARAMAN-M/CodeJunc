Add-Type -AssemblyName System.Drawing

$src = "C:\Desktop\CodeJunc\WhatsApp Image 2026-11-16 at 10.59.30 AM.jpeg"
$bmp = New-Object System.Drawing.Bitmap($src)
$outDir = "C:\Desktop\CodeJunc\assets\brand"

function Extract-Transparent-Crop($cropX, $cropY, $cropW, $cropH, $bgR, $bgG, $bgB, $isDark, $thresholdLow, $thresholdHigh, $outName) {
    $target = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    for ($y = 0; $y -lt $cropH; $y++) {
        for ($x = 0; $x -lt $cropW; $x++) {
            $srcX = $cropX + $x
            $srcY = $cropY + $y
            if ($srcX -lt 0 -or $srcX -ge $bmp.Width -or $srcY -lt 0 -or $srcY -ge $bmp.Height) {
                $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                continue
            }
            $p = $bmp.GetPixel($srcX, $srcY)
            $diff = [Math]::Sqrt([Math]::Pow($p.R - $bgR, 2) + [Math]::Pow($p.G - $bgG, 2) + [Math]::Pow($p.B - $bgB, 2))
            
            # Additional check for dark / light backgrounds
            $isBg = $false
            if ($isDark) {
                if ($diff -lt $thresholdLow -or ($p.R -lt 40 -and $p.G -lt 40 -and $p.B -lt 40)) {
                    $isBg = $true
                }
            } else {
                if ($diff -lt $thresholdLow -or ($p.R -gt 230 -and $p.G -gt 228 -and $p.B -gt 220)) {
                    $isBg = $true
                }
            }
            
            if ($isBg) {
                $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } elseif ($diff -lt $thresholdHigh) {
                $aFrac = ($diff - $thresholdLow) / ($thresholdHigh - $thresholdLow)
                if ($aFrac -lt 0.08) {
                    $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                    continue
                }
                $alpha = [int]($aFrac * 255.0)
                if ($alpha -gt 255) { $alpha = 255 }
                if ($alpha -lt 0) { $alpha = 0 }
                
                $fgR = [Math]::Min(255, [Math]::Max(0, [int](($p.R - (1.0 - $aFrac) * $bgR) / $aFrac)))
                $fgG = [Math]::Min(255, [Math]::Max(0, [int](($p.G - (1.0 - $aFrac) * $bgG) / $aFrac)))
                $fgB = [Math]::Min(255, [Math]::Max(0, [int](($p.B - (1.0 - $aFrac) * $bgB) / $aFrac)))
                $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $fgR, $fgG, $fgB))
            } else {
                $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $p.R, $p.G, $p.B))
            }
        }
    }
    
    $outPath = Join-Path $outDir $outName
    $target.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $target.Dispose()
    Write-Host "Created $outPath ($cropW x $cropH)"
}

# 1. Brand Mark (Dark background):
Extract-Transparent-Crop 172 330 200 146 28.0 28.0 28.0 $true 18.0 52.0 "brand-mark-transparent.png"

# 2. Logo Dark (white text + orange logo on dark background):
Extract-Transparent-Crop 74 115 396 92 28.0 28.0 28.0 $true 18.0 52.0 "logo-dark-transparent.png"

# 3. Logo Light (dark text + orange logo on light background):
Extract-Transparent-Crop 564 115 385 92 246.0 243.0 236.0 $false 18.0 52.0 "logo-light-transparent.png"

$bmp.Dispose()
Write-Host "Done all extractions!"
