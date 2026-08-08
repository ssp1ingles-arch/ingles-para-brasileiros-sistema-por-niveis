param([string]$Raiz=(Split-Path -Parent $PSScriptRoot))
node (Join-Path $Raiz 'scripts\validar.mjs') $Raiz
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
node (Join-Path $Raiz 'scripts\validar-lote007.mjs')
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
node (Join-Path $Raiz 'scripts\validar-lote008.mjs')
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
node (Join-Path $Raiz 'scripts\validar-lote009.mjs')
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
node (Join-Path $Raiz 'scripts\validar-lote010.mjs')
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
node (Join-Path $Raiz 'scripts\validar-lote011.mjs')
exit $LASTEXITCODE
