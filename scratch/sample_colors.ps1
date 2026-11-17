Add-Type -AssemblyName System.Drawing

$src = "C:\Desktop\CodeJunc\WhatsApp Image 2026-11-16 at 10.59.30 AM.jpeg"
$bmp = New-Object System.Drawing.Bitmap($src)

# Check colors in the bottom-left quadrant (Brand mark)
# Corners of the brand mark crop:
# Let's sample top-left, top-right, bottom-left of the brand mark box
Write-Host "Color at (170, 320): " ($bmp.GetPixel(170, 320).ToString())
Write-Host "Color at (180, 330): " ($bmp.GetPixel(180, 330).ToString())
Write-Host "Color at (360, 330): " ($bmp.GetPixel(360, 330).ToString())
Write-Host "Color at (180, 460): " ($bmp.GetPixel(180, 460).ToString())

$bmp.Dispose()
