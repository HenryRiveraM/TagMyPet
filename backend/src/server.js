import { app } from './app.js';
import { connectDB } from './config/db.js';
import { startReminderNotificationJob } from './services/reminderNotifications.js';

const port = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`TagMyPet API listening on ${port}`);
      startReminderNotificationJob();
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
