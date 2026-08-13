<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DirectoryController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->where('id', '!=', auth()->id())
            ->where('status', 'active')
            ->select('id', 'name', 'role', 'avatar_path')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }
}