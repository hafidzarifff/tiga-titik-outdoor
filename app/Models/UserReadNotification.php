<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserReadNotification extends Model
{
    protected $fillable = ['user_id', 'notification_id'];
}
