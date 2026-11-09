# Prosty skrypt do backupu bazy danych (PowerShell)

$DbName    = "app_database"
$BackupDir = "C:\Backups\db"
$Date      = Get-Date -Format "yyyyMMdd_HHmmss"
$SqlFile   = Join-Path $BackupDir "${DbName}_${Date}.sql"
$FileName  = "$SqlFile.gz"

# Sprawdź czy katalog istnieje
if (-not (Test-Path -Path $BackupDir -PathType Container)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Host "Utworzono katalog $BackupDir"
}

# Wykonaj backup
Write-Host "Rozpoczynam backup bazy $DbName..."

try {
    # mysqldump zapisuje bezpośrednio do pliku (--result-file), co omija
    # konwersję kodowania przez potok PowerShell
    & mysqldump -u root -p --result-file="$SqlFile" $DbName
    if ($LASTEXITCODE -ne 0) {
        throw "mysqldump zakończył się kodem $LASTEXITCODE"
    }

    # Kompresja GZip (odpowiednik | gzip)
    $inStream  = [System.IO.File]::OpenRead($SqlFile)
    $outStream = [System.IO.File]::Create($FileName)
    $gzip      = New-Object System.IO.Compression.GZipStream($outStream, [System.IO.Compression.CompressionMode]::Compress)
    try {
        $inStream.CopyTo($gzip)
    }
    finally {
        $gzip.Dispose()
        $outStream.Dispose()
        $inStream.Dispose()
    }
    Remove-Item $SqlFile

    Write-Host "Backup zakończony sukcesem: $FileName" -ForegroundColor Green
}
catch {
    Write-Host "Błąd podczas wykonywania backupu! $_" -ForegroundColor Red
    if (Test-Path $SqlFile) { Remove-Item $SqlFile }
    exit 1
}
