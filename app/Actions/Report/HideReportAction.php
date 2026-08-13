<?php
namespace App\Actions\Report;
use App\Models\Report;
use App\Models\User;
use App\Repositories\Contracts\ReportRepositoryInterface;
class HideReportAction
{
    public function __construct(
        private ReportRepositoryInterface $reports,
    ) {
    }
    public function execute(Report $report, User $actor): Report
    {
        $column = $actor->isMentor() ? 'hidden_by_mentor_at' : 'hidden_by_intern_at';

        return $this->reports->update($report, [
            $column => now(),
        ]);
    }
}