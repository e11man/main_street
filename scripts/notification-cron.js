/**
 * Notification Cron Job Script
 * 
 * This script runs the notification processing system at regular intervals.
 * It should be set up as a cron job to run every minute for 5-minute notifications
 * and every 5 minutes for 30-minute notifications.
 * 
 * Usage examples:
 * - For 5-minute notifications: */5 * * * * node scripts/notification-cron.js 5min
 * - For 30-minute notifications: */30 * * * * node scripts/notification-cron.js 30min
 * - For both: */5 * * * * node scripts/notification-cron.js both
 */

import { processBatchedNotifications, cleanupOldNotificationRecords } from '../lib/notificationJobSystem.js';

async function runNotificationCron() {
  const frequency = process.argv[2];
  
  if (!frequency) {
    console.error('Usage: node scripts/notification-cron.js <frequency>');
    console.error('Frequencies: 5min, 30min, both, cleanup');
    process.exit(1);
  }
  
  try {
    console.log(`Starting notification cron job for frequency: ${frequency}`);
    console.log(`Time: ${new Date().toISOString()}`);
    
    switch (frequency) {
      case '5min':
        await processBatchedNotifications('5min');
        break;
        
      case '30min':
        await processBatchedNotifications('30min');
        break;
        
      case 'both':
        await processBatchedNotifications('5min');
        await processBatchedNotifications('30min');
        break;
        
      case 'cleanup':
        await cleanupOldNotificationRecords();
        break;
        
      default:
        console.error(`Invalid frequency: ${frequency}`);
        console.error('Valid frequencies: 5min, 30min, both, cleanup');
        process.exit(1);
    }
    
    console.log(`Notification cron job completed for frequency: ${frequency}`);
    console.log(`Time: ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error(`Notification cron job failed for frequency ${frequency}:`, error);
    process.exit(1);
  }
}

// Run the cron job
runNotificationCron();