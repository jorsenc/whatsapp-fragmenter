$path = 'C:\GOOSE\model-tester\index.html'
$text = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$startTag = '<script>'
$endTag = '</script>'
$i = $text.IndexOf($startTag)
$j = $text.IndexOf($endTag, $i)
if ($i -lt 0 -or $j -lt 0) { Write-Host 'no script tags found'; exit 1 }
$script = $text.Substring($i + $startTag.Length, $j - $i - $startTag.Length)
[System.IO.File]::WriteAllText('C:\GOOSE\_app_script.js', $script, [System.Text.Encoding]::UTF8)
Write-Host ('Script extracted: ' + $script.Length + ' chars')
Write-Host ('Lines: ' + ($script -split "`n").Count)