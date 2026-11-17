Add-Type -AssemblyName System.Drawing

function Inspect-Image($path) {
    $bmp = New-Object System.Drawing.Bitmap($path)
    Write-Host "=== Inspecting $path ($($bmp.Width)x$($bmp.Height)) ==="
    $nonZeroAlphaEdges = 0
    # Check top and bottom rows
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        if ($bmp.GetPixel($x, 0).A -gt 0) { $nonZeroAlphaEdges++ }
        if ($bmp.GetPixel($x, $bmp.Height - 1).A -gt 0) { $nonZeroAlphaEdges++ }
    }
    # Check left and right columns
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        if ($bmp.GetPixel(0, $y).A -gt 0) { $nonZeroAlphaEdges++ }
        if ($bmp.GetPixel($bmp.Width - 1, $y).A -gt 0) { $nonZeroAlphaEdges++ }
    }
    Write-Host "Non-zero alpha edge pixels: $nonZeroAlphaEdges"
    $bmp.Dispose()
}

Inspect-Image "C:\Desktop\CodeJunc\assets\brand\brand-mark-transparent.png"
Inspect-Image "C:\Desktop\CodeJunc\assets\brand\logo-dark-transparent.png"
Inspect-Image "C:\Desktop\CodeJunc\assets\brand\logo-light-transparent.png"
