<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\RolePermission;
use App\Models\User;
use App\Services\RolePermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class RolePermissionController extends Controller
{
    public function __construct(
        private RolePermissionService $rolePermissions,
    ) {
    }

    public function index(): JsonResponse
    {
        Gate::authorize('manage', User::class);

        $rows = RolePermission::orderBy('permission_key')->orderBy('role')->get();

        return response()->json(['success' => true, 'data' => $rows]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        Gate::authorize('manage', User::class);

        $row = RolePermission::findOrFail($id);

        $validated = $request->validate([
            'enabled' => 'required|boolean',
        ]);

        if ($row->role === 'admin' && $row->permission_key === 'gerer_utilisateurs' && ! $validated['enabled']) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'CANNOT_DISABLE_SELF',
                    'message' => "Impossible de desactiver cette permission pour Admin, cela verrouillerait l'acces a cette page.",
                ],
            ], 422);
        }

        $row->update(['enabled' => $validated['enabled']]);
        $this->rolePermissions->clearCache($row->role, $row->permission_key);

        return response()->json(['success' => true, 'data' => $row]);
    }
}