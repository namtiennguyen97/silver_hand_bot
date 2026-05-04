// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
    let data = { title: 'Thông báo SAO-ĐÊM', body: 'Bạn có sự kiện mới!' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/assets/img/mayor_avatar.jpg',
        badge: '/assets/img/mayor_avatar.jpg',
        image: data.image || null, // Ảnh lớn (nếu có)
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
