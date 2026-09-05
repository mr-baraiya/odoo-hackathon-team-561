const express = require('express');
const { authenticateJWT } = require('../middleware/auth.middleware');

const router = express.Router();

const NOTIFICATIONS = [
  { id: 'notif_101', title: 'Approval Required', message: 'Quote Q-2026-101 requires manager approval.', is_read: false, created_at: new Date().toISOString() },
  { id: 'notif_102', title: 'Stalled Deal Alert', message: 'Quote Q-2026-102 has been inactive for 9 days.', is_read: false, created_at: new Date().toISOString() },
];

router.get('/unread', authenticateJWT, (req, res) => {
  res.json(NOTIFICATIONS.filter((n) => !n.is_read));
});

router.patch('/read-all', authenticateJWT, (req, res) => {
  NOTIFICATIONS.forEach((n) => { n.is_read = true; });
  res.json({ message: 'All notifications marked as read' });
});

router.get('/', authenticateJWT, (req, res) => {
  res.json(NOTIFICATIONS);
});

router.patch('/:id/read', authenticateJWT, (req, res) => {
  const notif = NOTIFICATIONS.find((n) => n.id === req.params.id);
  if (notif) notif.is_read = true;
  res.json({ message: 'Notification marked as read', notification: notif });
});

module.exports = router;
