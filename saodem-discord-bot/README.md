# SAO-DEM Discord Alert Bot

Bot Discord để tự động nhắc lịch event camp, thay cho việc từng người phải vào web bật browser notification.

Bot này chạy 24/7 trên VPS, đến giờ sẽ gửi tin vào channel bạn cấu hình và tag role hoặc `@everyone`.

## 1. Bot Này Là Gì?

Web hiện tại (`schedule.html`) là kiểu:

- Người dùng tự vào web.
- Tự bật notification.
- Browser xin quyền thông báo.

Bot này là kiểu:

- Bot chạy trên VPS.
- Bạn setup một channel Discord.
- Đến giờ event, bot tự gửi tin và tag mọi người.

Nên dùng role riêng như `@Camp Alert` thay vì `@everyone`. Nếu vẫn muốn tag all, bot có hỗ trợ `mention_everyone`.

## 2. Cài Trên VPS

SSH vào VPS, rồi clone repo của bạn:

```bash
git clone <your-github-repo-url>
cd <your-repo>/saodem-discord-bot
```

Cài dependency:

```bash
npm install
```

Tạo file `.env` từ mẫu:

```bash
cp .env.example .env
nano .env
```

Điền các giá trị:

```env
DISCORD_TOKEN=token_bot_cua_ban
DISCORD_CLIENT_ID=application_client_id
DISCORD_GUILD_ID=server_id
BOT_TIMEZONE=Asia/Bangkok
SCHEDULER_INTERVAL_SECONDS=30
```

## 3. Tạo Bot Trên Discord

Vào Discord Developer Portal:

1. Create Application.
2. Vào tab Bot, tạo bot và copy token.
3. Vào OAuth2 URL Generator:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions:
     - Send Messages
     - View Channels
     - Use Slash Commands
     - Mention Everyone, nếu bạn muốn dùng `@everyone`
4. Mở URL invite và add bot vào server.

## 4. Deploy Slash Commands

Sau khi điền `.env`, chạy:

```bash
npm run deploy:commands
```

Trong Discord server sẽ có các command:

- `/setup`
- `/config`
- `/events`
- `/event-toggle`
- `/bot-toggle`
- `/test-alert`
- `/ping`

## 5. Chạy Bot

Chạy thử:

```bash
npm start
```

Nếu console hiện:

```text
Logged in as ...
Scheduler starting...
```

là ổn.

## 6. Setup Trong Discord

Trong server Discord, chạy:

```text
/setup channel:#ten-channel role:@Camp Alert mention_everyone:false
```

Nếu bạn thật sự muốn tag all:

```text
/setup channel:#ten-channel mention_everyone:true
```

Sau đó test:

```text
/test-alert
```

## 7. Chạy 24/7 Bằng PM2

Cài PM2:

```bash
npm install -g pm2
```

Start bot:

```bash
pm2 start src/bot.js --name saodem-alert-bot
pm2 save
pm2 startup
```

Xem log:

```bash
pm2 logs saodem-alert-bot
```

Restart sau khi pull code mới:

```bash
git pull
npm install
npm run deploy:commands
pm2 restart saodem-alert-bot
```

## 8. Sửa Lịch Event

Lịch nằm ở:

```text
data/events.json
```

Ví dụ một reminder:

```json
{
  "weekday": 2,
  "time": "22:20",
  "label": "TUE 22:20 INGAME",
  "message": "Camp Invasion starts soon. Gather and prepare for battle."
}
```

`weekday` dùng chuẩn ISO:

- `1` = Monday
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday
- `7` = Sunday

`time` hiện đang là giờ thật theo `BOT_TIMEZONE`, còn `label` là text hiển thị trong Discord. Nếu sau này bạn muốn đổi từ giờ ingame sang giờ thật bằng công thức riêng, mình sẽ thêm module convert Hope 101 time vào scheduler.

## 9. Lưu Ý Quan Trọng

- VPS phải chạy đúng timezone hoặc `.env` phải set `BOT_TIMEZONE=Asia/Bangkok`.
- Nếu dùng `@everyone`, bot cần permission `Mention Everyone`.
- Nếu không muốn spam cả server, hãy tạo role `Camp Alert` và tag role đó.
- Bot không cần web `schedule.html` để hoạt động.
