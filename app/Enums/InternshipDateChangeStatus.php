<?php

namespace App\Enums;

enum InternshipDateChangeStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
}
