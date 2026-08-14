<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileStorageService
{
    private const ALLOWED_MIME_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
    ];

    private const ALLOWED_EXTENSIONS = [
        'pdf',
        'jpg',
        'jpeg',
        'png',
    ];

    private const MAX_FILE_SIZE_KB = 10240;

    public function store(UploadedFile $file, string $folder): string
    {
        $this->validateFile($file);

        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();

        return $file->storeAs($folder, $filename, 'local');
    }

    public function storePublic(UploadedFile $file, string $folder): string
    {
        $this->validateFile($file);
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();

        return $file->storeAs($folder, $filename, 'public');
    }

    public function publicUrl(string $path): string
    {
        return Storage::disk('public')->url($path);
    }

    public function deletePublic(string $path): bool
    {
        return Storage::disk('public')->delete($path);
    }

    public function temporaryUrl(string $path, int $minutes = 15): string
    {
        if (! Storage::disk('local')->exists($path)) {
            throw new \RuntimeException('Le fichier demandé est introuvable.');
        }

        return Storage::disk('local')->temporaryUrl(
            $path,
            now()->addMinutes($minutes)
        );
    }

    public function delete(string $path): bool
    {
        return Storage::disk('local')->delete($path);
    }

    private function validateFile(UploadedFile $file): void
    {
        $extension = strtolower((string) $file->getClientOriginalExtension());

        if (! in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            throw new \InvalidArgumentException('Extension de fichier non autorisée.');
        }

        if (! in_array($file->getMimeType(), self::ALLOWED_MIME_TYPES, true)) {
            throw new \InvalidArgumentException('Type de fichier non autorisé.');
        }

        if ($file->getSize() > self::MAX_FILE_SIZE_KB * 1024) {
            throw new \InvalidArgumentException('Le fichier dépasse la taille maximale autorisée de 10 Mo.');
        }

        $realPath = $file->getRealPath();
        if (! is_string($realPath) || ! is_file($realPath)) {
            throw new \InvalidArgumentException('Le fichier uploadé est invalide.');
        }

        $contents = @file_get_contents($realPath);
        if ($contents === false || $contents === '') {
            throw new \InvalidArgumentException('Le fichier uploadé est vide ou illisible.');
        }

        $isPdf = str_starts_with($contents, '%PDF');
        $isPng = str_starts_with($contents, "\x89PNG\r\n\x1a\n");
        $isJpeg = str_starts_with($contents, "\xFF\xD8\xFF");

        if ($extension === 'pdf' && ! $isPdf) {
            throw new \InvalidArgumentException('Le fichier PDF est invalide.');
        }

        if (in_array($extension, ['png'], true) && ! $isPng) {
            throw new \InvalidArgumentException('Le fichier PNG est invalide.');
        }

        if (in_array($extension, ['jpg', 'jpeg'], true) && ! $isJpeg) {
            throw new \InvalidArgumentException('Le fichier image est invalide.');
        }
    }
}