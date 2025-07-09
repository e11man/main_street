import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const metricsCollection = db.collection('metrics');
    const opportunitiesCollection = db.collection('opportunities');
    const usersCollection = db.collection('users');
    const organizationsCollection = db.collection('companies');

    // GET: Fetch current metrics
    if (req.method === 'GET') {
      let metrics = await metricsCollection.findOne({ _id: 'main' });
      
      if (!metrics) {
        // Initialize metrics if they don't exist
        metrics = {
          _id: 'main',
          volunteersConnected: 0,
          organizationsInvolved: 0,
          hoursServed: 0,
          lastUpdated: new Date()
        };
        await metricsCollection.insertOne(metrics);
      }

      return res.status(200).json(metrics);
    }

    // POST: Update metrics (for signups)
    if (req.method === 'POST') {
      const { action, opportunityId, userId, hours } = req.body;

      if (!action || !opportunityId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      let metrics = await metricsCollection.findOne({ _id: 'main' });
      
      if (!metrics) {
        // Initialize metrics if they don't exist
        metrics = {
          _id: 'main',
          volunteersConnected: 0,
          organizationsInvolved: 0,
          hoursServed: 0,
          lastUpdated: new Date()
        };
        await metricsCollection.insertOne(metrics);
      }

      if (action === 'signup') {
        // Increment hours served
        const hoursToAdd = hours || 0;
        await metricsCollection.updateOne(
          { _id: 'main' },
          { 
            $inc: { hoursServed: hoursToAdd },
            $set: { lastUpdated: new Date() }
          }
        );
      } else if (action === 'cancel') {
        // Decrement hours served
        const hoursToSubtract = hours || 0;
        await metricsCollection.updateOne(
          { _id: 'main' },
          { 
            $inc: { hoursServed: -hoursToSubtract },
            $set: { lastUpdated: new Date() }
          }
        );
      }

      // Return updated metrics
      const updatedMetrics = await metricsCollection.findOne({ _id: 'main' });
      return res.status(200).json(updatedMetrics);
    }

    // PUT: Recalculate all metrics from scratch
    if (req.method === 'PUT') {
      // Count total users (volunteers)
      const volunteersCount = await usersCollection.countDocuments({ 
        isAdmin: { $ne: true } // Exclude admins from volunteer count
      });

      // Count unique organizations
      const organizationsCount = await organizationsCollection.countDocuments({});

      // Calculate total hours served from opportunities
      let totalHoursServed = 0;
      const opportunities = await opportunitiesCollection.find({}).toArray();
      
      for (const opportunity of opportunities) {
        if (opportunity.spotsFilled && opportunity.duration) {
          // Calculate hours based on duration and spots filled
          const durationInHours = parseFloat(opportunity.duration) || 0;
          const spotsFilled = parseInt(opportunity.spotsFilled) || 0;
          totalHoursServed += durationInHours * spotsFilled;
        }
      }

      // Update metrics
      const updatedMetrics = {
        _id: 'main',
        volunteersConnected: volunteersCount,
        organizationsInvolved: organizationsCount,
        hoursServed: Math.round(totalHoursServed),
        lastUpdated: new Date()
      };

      await metricsCollection.replaceOne({ _id: 'main' }, updatedMetrics);

      return res.status(200).json(updatedMetrics);
    }

  } catch (error) {
    console.error('Metrics API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}