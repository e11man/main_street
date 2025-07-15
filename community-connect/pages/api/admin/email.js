import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyToken } from '../../../lib/authUtils';

export default async function handler(req, res) {
  try {
    // Check if cookies exist
    if (!req.cookies) {
      return res.status(401).json({ error: 'Unauthorized: No cookies available' });
    }

    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    
    if (req.method === 'POST') {
      const { recipients, events, subject, body = '' } = req.body;
      
      // Validate input
      if (!recipients || !Array.isArray(recipients)) {
        return res.status(400).json({ error: 'Recipients array is required' });
      }
      
      if (!subject) {
        return res.status(400).json({ error: 'Subject is required' });
      }
      
      // Get recipient details from database
      const usersCollection = db.collection('users');
      const organizationsCollection = db.collection('companies');
      
      const userIds = recipients.filter(r => r.type === 'user').map(r => new ObjectId(r.id));
      const organizationIds = recipients.filter(r => r.type === 'organization').map(r => new ObjectId(r.id));
      
      const users = await usersCollection.find({ _id: { $in: userIds } }).toArray();
      const organizations = await organizationsCollection.find({ _id: { $in: organizationIds } }).toArray();
      
      // Combine all email addresses
      const emailAddresses = [
        ...users.map(user => user.email),
        ...organizations.map(org => org.email),
        ...recipients.filter(r => r.type === 'pa').map(r => r.email)
      ].filter(Boolean);
      
      if (emailAddresses.length === 0) {
        return res.status(400).json({ error: 'No valid email addresses found' });
      }
      
      // Generate email content with event information
      let emailContent = body;
      
      if (events && events.length > 0) {
        const eventsInfo = events.map(event => {
          return `
📅 **${event.title}**
📅 Date: ${event.date}
⏰ Time: ${event.arrivalTime} - ${event.departureTime}
📍 Location: ${event.location}
📝 Description: ${event.description}
🏢 Organization: ${event.organizationName}
👥 Spots Available: ${event.spotsTotal - (event.spotsFilled || 0)}/${event.spotsTotal}
          `.trim();
        }).join('\n\n---\n\n');
        
        if (emailContent) {
          emailContent += '\n\n' + eventsInfo;
        } else {
          emailContent = eventsInfo;
        }
      }
      
      // Create mailto link
      const mailtoLink = `mailto:${emailAddresses.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailContent)}`;
      
      // Log the email action for audit purposes
      const emailLog = {
        adminId: decoded.adminId || decoded.userId,
        adminEmail: decoded.email,
        recipients: emailAddresses,
        subject,
        body: emailContent,
        events: events || [],
        createdAt: new Date(),
        status: 'composed'
      };
      
      await db.collection('emailLogs').insertOne(emailLog);
      
      return res.status(200).json({
        success: true,
        mailtoLink,
        recipientCount: emailAddresses.length,
        logId: emailLog._id
      });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin email API error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}