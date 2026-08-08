param(
  [string]$Raiz=(Split-Path -Parent $PSScriptRoot),
  [string]$Fonte=(Join-Path (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) 'Arquivo_Fonte')
)
$files=Get-ChildItem -LiteralPath $Fonte -File -Filter '*.md' | Where-Object {$_.Name -match '^(\d{4})_' -and [int]$Matches[1] -ge 1 -and [int]$Matches[1] -le 1547} | Sort-Object Name
if($files.Count -ne 1547){throw "Esperados 1547 arquivos; encontrados $($files.Count)."}
$reviewPath=Join-Path $Raiz 'dados\revisao-fontes.json';$reviews=if(Test-Path $reviewPath){Get-Content -LiteralPath $reviewPath -Raw|ConvertFrom-Json -AsHashtable}else{@{}}
$allUnits=Get-ChildItem -LiteralPath (Join-Path $Raiz 'dados') -Recurse -Filter 'unidades.json' | ForEach-Object {Get-Content -LiteralPath $_.FullName -Raw|ConvertFrom-Json}
$items=foreach($f in $files){$head=(Get-Content -LiteralPath $f.FullName -TotalCount 24) -join "`n"; $id=[int]$f.Name.Substring(0,4);$key='{0:D4}' -f $id;$linked=@($allUnits|Where-Object {$_.fonte.arquivo -eq $f.Name -or $_.fontes.arquivo -contains $f.Name}|ForEach-Object id);$review=$reviews[$key]; [ordered]@{id=$key;arquivo=$f.Name;bytes=$f.Length;sha256=(Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash.ToLower();arquivo_original=([regex]::Match($head,'(?m)^arquivo_origem: "(.*)"$').Groups[1].Value);sistema_origem=([regex]::Match($head,'(?m)^sistema_origem: "(.*)"$').Groups[1].Value);duplicata_de=([regex]::Match($head,'(?m)^duplicata_de: "(.*)"$').Groups[1].Value);estado_revisao=if($review){$review.estado}else{'não analisada'};secoes=if($review){@($review.secoes)}else{@()};unidades=$linked}}
[ordered]@{gerado_em=(Get-Date).ToString('s');total=$items.Count;fonte_somente_leitura=$Fonte;arquivos=$items}|ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $Raiz 'dados\mapa-fontes.json') -Encoding utf8
