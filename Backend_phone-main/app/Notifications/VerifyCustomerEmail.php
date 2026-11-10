<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class VerifyCustomerEmail extends Notification
{
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $path = URL::temporarySignedRoute('customer.verify', now()->addDay(), [
            'user' => $notifiable->id,
            'hash' => sha1($notifiable->email),
        ], absolute: false);

        return (new MailMessage)
            ->subject('Xác nhận tài khoản PhoneStore')
            ->greeting('Chào '.$notifiable->name.'!')
            ->line('Cảm ơn bạn đã đăng ký tài khoản PhoneStore.')
            ->action('Xác nhận email', rtrim(config('app.url'), '/').$path)
            ->line('Liên kết có hiệu lực trong 24 giờ.');
    }
}
