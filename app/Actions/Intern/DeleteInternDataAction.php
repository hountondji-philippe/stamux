<?php

namespace App\Actions\Intern;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DeleteInternDataAction
{
    public function execute(User $user): void
    {
        DB::table('reports')->where('intern_id', $user->id)->delete();
        DB::table('project_intern')->where('intern_id', $user->id)->delete();
        DB::table('attendances')->where('intern_id', $user->id)->delete();
        DB::table('documents')->where('intern_id', $user->id)->delete();
        DB::table('permissions')->where('intern_id', $user->id)->delete();
        DB::table('internship_date_change_requests')->where('intern_id', $user->id)->delete();

        $user->update([
            'name' => 'Ancien stagiaire',
            'email' => 'archived_'.hash('sha256', $user->email).'@nextmux.deleted',
            'avatar_path' => null,
            'status' => UserStatus::Inactive->value,
        ]);

        $user->delete();
    }
}