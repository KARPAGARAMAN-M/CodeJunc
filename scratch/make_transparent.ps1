Add-Type -AssemblyName System.Drawing

function Make-Transparent-Dark($srcPath, $dstPath) {
    $src = New-Object System.Drawing.Bitmap($srcPath)
    $w = $src.Width
    $h = $src.Height
    $dst = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    # Background color is around RGB(29, 29, 27)
    $bgR = 29.0
    $bgG = 29.0
    $bgB = 27.0
    
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $p = $src.GetPixel($x, $y)
            $diff = [Math]::Sqrt([Math]::Pow($p.R - $bgR, 2) + [Math]::Pow($p.G - $bgG, 2) + [Math]::Pow($p.B - $bgB, 2))
            if ($diff -lt 12) {
                $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } elseif ($diff -lt 35) {
                $alpha = [int](($diff - 12) / (35 - 12) * 255)
                if ($alpha -gt 255) { $alpha = 255 }
                $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $p.R, $p.G, $p.B))
            } else {
                $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $p.R, $p.G, $p.B))
            }
        }
    }
    $dst.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $src.Dispose()
    $dst.Dispose()
    Write-Host "Created $dstPath"
}

function Make-Transparent-Light($srcPath, $dstPath) {
    $src = New-Object System.Drawing.Bitmap($srcPath)
    $w = $src.Width
    $h = $src.Height
    $dst = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    # Background color is around RGB(246, 243, 236)
    $bgR = 246.0
    $bgG = 243.0
    $bgB = 236.0
    
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $p = $src.GetPixel($x, $y)
            $diff = [Math]::Sqrt([Math]::Pow($p.R - $bgR, 2) + [Math]::Pow($p.G - $bgG, 2) + [Math]::Pow($p.B - $bgB, 2))
            if ($diff -lt 14) {
                $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } elseif ($diff -lt 40) {
                $alpha = [int](($diff - 14) / (40 - 14) * 255)
                if ($alpha -gt 255) { $alpha = 255 }
                $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $p.R, $p.G, $p.B))
            } else {
                $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $p.R, $p.G, $p.B))
            }
        }
    }
    $dst.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $src.Dispose()
    $dst.Dispose()
    Write-Host "Created $dstPath"
}

Make-Transparent-Dark "C:\Desktop\CodeJunc\assets\brand\logo-dark.png" "C:\Desktop\CodeJunc\assets\brand\logo-dark-trans.png"
Make-Transparent-Light "C:\Desktop\CodeJunc\assets\brand\logo-light.png" "C:\Desktop\CodeJunc\assets\brand\logo-light-trans.png"
Make-Transparent-Dark "C:\Desktop\CodeJunc\assets\brand\brand-mark.png" "C:\Desktop\CodeJunc\assets\brand\brand-mark-trans.png"

Write-Host "Transparent images created successfully."
