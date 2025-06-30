require('dotenv').config({ path: '../.env.local' }); // Adjust path as needed if script is run from a different directory

import { MongoClient, ObjectId } from 'mongodb';

async function seedInitialChats() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB...');

    const db = client.db('mainStreetOpportunities'); // Use your actual database name
    const usersCollection = db.collection('users');
    const opportunitiesCollection = db.collection('opportunities');
    const companiesCollection = db.collection('companies'); // To get company details if needed
    const chatMessagesCollection = db.collection('chatMessages');

    const usersWithCommitments = await usersCollection.find({
      commitments: { $exists: true, $not: { $size: 0 } }
    }).toArray();

    if (usersWithCommitments.length === 0) {
      console.log('No users with commitments found. Nothing to seed.');
      return;
    }

    console.log(`Found ${usersWithCommitments.length} users with commitments.`);
    let chatsSeeded = 0;

    for (const user of usersWithCommitments) {
      if (!user.commitments || user.commitments.length === 0) continue;

      console.log(`\nProcessing user: ${user.name} (${user._id})`);

      for (const commitment of user.commitments) {
        // Commitment can be stored as string or ObjectId, ensure we handle it.
        // Opportunity IDs in the opportunities collection are numbers (id field) or ObjectId (_id field)
        // User commitments seem to store opportunity 'id' as a number or string.

        let opportunity;
        // Try finding by numeric ID first if commitment is a number or string that can be parsed
        const numericCommitmentId = parseInt(commitment);
        if (!isNaN(numericCommitmentId)) {
            opportunity = await opportunitiesCollection.findOne({ id: numericCommitmentId });
        }

        // If not found, and if commitment might be an ObjectId string, try finding by _id
        if (!opportunity && typeof commitment === 'string' && ObjectId.isValid(commitment)) {
            opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(commitment) });
        } else if (!opportunity && commitment instanceof ObjectId) {
            opportunity = await opportunitiesCollection.findOne({ _id: commitment });
        }


        if (!opportunity) {
          console.warn(`  Opportunity with ID/commitment '${commitment}' not found for user ${user._id}. Skipping chat seeding for this commitment.`);
          continue;
        }

        console.log(`  Found opportunity: ${opportunity.title} (ID: ${opportunity.id || opportunity._id}, OriginalCommitmentRef: ${commitment})`);

        // Determine the company/organization ID for this opportunity
        let companyId = opportunity.companyId || opportunity.company?._id;
        if (companyId && !(companyId instanceof ObjectId)) {
            try {
                companyId = new ObjectId(companyId);
            } catch (e) {
                console.warn(`    Invalid companyId format ('${companyId}') for opportunity ${opportunity.id || opportunity._id}. Skipping.`);
                continue;
            }
        }


        if (!companyId) {
          // If companyId is not directly on opportunity, try fetching company via companyName if available
          // This is a fallback and might not be robust if companyName isn't unique or linked.
          // A direct companyId reference on the opportunity schema is better.
          console.warn(`    companyId not found directly on opportunity ${opportunity.id || opportunity._id}.`);
          // Attempt to find company if companyName exists and is linked to a company document
          if (opportunity.companyName) {
            const hostingCompany = await companiesCollection.findOne({ name: opportunity.companyName });
            if (hostingCompany && hostingCompany._id) {
              companyId = hostingCompany._id;
              console.log(`    Found company '${hostingCompany.name}' by name, ID: ${companyId}`);
            } else {
              console.warn(`    Could not find company by name '${opportunity.companyName}' for opportunity ${opportunity.id || opportunity._id}. Skipping chat for this commitment.`);
              continue;
            }
          } else {
            console.warn(`    companyName also not available on opportunity ${opportunity.id || opportunity._id}. Skipping chat for this commitment.`);
            continue;
          }
        }

        // Check if chat already exists for this user and opportunity to avoid duplicate seeding
        const existingChat = await chatMessagesCollection.findOne({
            opportunityId: opportunity._id || new ObjectId(opportunity.id), // Use the ObjectId of the opportunity
            $or: [
                { senderId: user._id, senderType: 'user' },
                { senderId: companyId, senderType: 'organization' }
            ]
        });

        if (existingChat) {
            console.log(`    Chat messages already exist for opportunity ${opportunity.id || opportunity._id} and user ${user._id}. Skipping.`);
            continue;
        }


        const messagesToInsert = [
          {
            opportunityId: opportunity._id || new ObjectId(opportunity.id), // Ensure this is the ObjectId of the opportunity
            senderId: companyId, // Organization's ID
            senderType: 'organization',
            message: `Hello ${user.name}! We're looking forward to having you at "${opportunity.title}". Do you have any questions before the event?`,
            timestamp: new Date(Date.now() - 120000), // 2 minutes ago
          },
          {
            opportunityId: opportunity._id || new ObjectId(opportunity.id),
            senderId: user._id, // User's ID
            senderType: 'user',
            message: `Thanks for the welcome! Just wondering if there's anything specific I should bring or prepare for?`,
            timestamp: new Date(Date.now() - 60000), // 1 minute ago
          },
        ];

        await chatMessagesCollection.insertMany(messagesToInsert);
        console.log(`    Seeded 2 initial messages for opportunity ${opportunity.id || opportunity._id} and user ${user._id}.`);
        chatsSeeded += 2;
      }
    }

    console.log(`\nSeed script finished. Total initial chat messages seeded: ${chatsSeeded}.`);

  } catch (e) {
    console.error('Error during chat seeding script:', e);
  } finally {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

seedInitialChats();
