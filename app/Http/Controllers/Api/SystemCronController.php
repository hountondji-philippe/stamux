<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class SystemCronController extends Controller
{
    public function markAbsent(Request $request): JsonResponse
    {
        if ($request->query('token') !== config('app.cron_secret')) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'UNAUTHORIZED', 'message' => 'Token invalide.'],
            ], 403);
        }

        Artisan::call('attendance:mark-absent');
        $output = Artisan::output();

        return response()->json([
            'success' => true,
            'data' => ['output' => trim($output)],
        ]);
    }
}