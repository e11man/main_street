/**
 * API Endpoint for User Authentication
 * -----------------------------
 * 
 * This API endpoint connects to MongoDB and provides user authentication functionality.
 * 
 * ENDPOINT USAGE:
 * - POST /api/users/signup: Creates a new user account
 * - POST /api/users/login: Authenticates a user and returns user data
 * - GET /api/users: Retrieves user data (requires authentication)
 */

import clientPromise from '../../lib/mongodb';
import { hash, compare } from 'bcrypt';
import { ObjectId } from 'mongodb';

async function handleRemoveCommitment(req, res, usersCollection, opportunitiesCollection) {
  const { userId, opportunityId } = req.body;
  
  // Validate input
  if (!userId || !opportunityId) {
    return res.status(400).json({ error: 'Missing userId or opportunityId' });
  }
  
  try {
    console.log('Removing commitment:', { userId, opportunityId });
    
    // Find user - convert string ID to MongoDB ObjectId
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User commitments before:', user.commitments);
    
    // Convert opportunityId to number for comparison
    const opportunityIdNum = parseInt(opportunityId);
    
    // Check if user has any commitments
    if (!user.commitments || user.commitments.length === 0) {
      return res.status(404).json({ error: 'User does not have any commitments' });
    }
    
    // Find the commitment in the user's commitments array
    let found = false;
    for (let i = 0; i < user.commitments.length; i++) {
      if (user.commitments[i] == opportunityId || user.commitments[i] == opportunityIdNum) {
        found = true;
        break;
      }
    }
    
    if (!found) {
      return res.status(404).json({ error: 'User does not have this commitment' });
    }
    
    // Remove commitment from user's commitments array
    const commitments = [];
    for (let i = 0; i < user.commitments.length; i++) {
      if (user.commitments[i] != opportunityId && user.commitments[i] != opportunityIdNum) {
        commitments.push(user.commitments[i]);
      }
    }
    
    console.log('User commitments after:', commitments);
    
    // Update user in database
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { commitments: commitments } }
    );
    
    // Decrement the spotsFilled count in the opportunity
    await opportunitiesCollection.updateOne(
      { id: parseInt(opportunityId) },
      { $inc: { spotsFilled: -1 } }
    );
    
    // Return updated user data (excluding password)
    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error removing commitment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default async function handler(req, res) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const usersCollection = db.collection('users');
    const opportunitiesCollection = db.collection('opportunities');
    
    // Handle different API operations based on query parameters
    if (req.method === 'POST') {
      if (req.query.signup === 'true') {
        return await handleSignup(req, res, usersCollection);
      } else if (req.query.login === 'true') {
        return await handleLogin(req, res, usersCollection);
      } else if (req.query.addCommitment === 'true') {
        return await handleAddCommitment(req, res, usersCollection, opportunitiesCollection);
      } else if (req.query.removeCommitment === 'true') {
        return await handleRemoveCommitment(req, res, usersCollection, opportunitiesCollection);
      } else {
        return res.status(400).json({ error: 'Invalid endpoint' });
      }
    } else if (req.method === 'GET') {
      // Get user data (would typically require authentication)
      const users = await usersCollection.find({}).toArray();
      return res.status(200).json(users);
    }
    
    // Default response for unsupported methods
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleSignup(req, res, usersCollection) {
  const { email, password, name } = req.body;
  
  // Validate input
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Normalize email to lowercase for case-insensitive handling
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check if email is blocked
  const client = await clientPromise;
  const db = client.db('mainStreetOpportunities');
  const blockedEmailsCollection = db.collection('blockedEmails');
  
  const isBlocked = await blockedEmailsCollection.findOne({ email: normalizedEmail });
  if (isBlocked) {
    // Return a special response that doesn't reveal the block status
    // The frontend will interpret this as a pending account
    return res.status(200).json({
      blocked: true,
      message: 'Your account has been created and is pending admin approval. You will be notified when your account is approved.'
    });
  }
  
  // Check if user already exists in users collection
  const existingUser = await usersCollection.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ error: 'User already exists' });
  }
  
  // Check if user already exists in pending users collection
  const pendingUsersCollection = db.collection('pendingUsers');
  const existingPendingUser = await pendingUsersCollection.findOne({ email: normalizedEmail });
  if (existingPendingUser) {
    return res.status(409).json({ error: 'Your account is pending approval. Please wait for admin confirmation.' });
  }
  
  // Hash password
  const hashedPassword = await hash(password, 10);
  
  // Create new user object
  const newUser = {
    email: normalizedEmail,
    password: hashedPassword,
    name,
    commitments: [], // Array to store opportunity IDs (max 2)
    createdAt: new Date()
  };
  
  // Check if email ends with taylor.edu
  if (normalizedEmail.endsWith('taylor.edu')) {
    // Taylor.edu emails don't need approval - insert directly into users collection
    const result = await usersCollection.insertOne(newUser);
    
    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json(userWithoutPassword);
  } else {
    // Non-Taylor emails need admin approval - insert into pendingUsers collection
    const result = await pendingUsersCollection.insertOne(newUser);
    
    // Return a pending status
    return res.status(202).json({
      message: 'Your account has been created and is pending admin approval.',
      pending: true
    });
  }
}

async function handleLogin(req, res, usersCollection) {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  
  // Normalize email to lowercase for case-insensitive handling
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check if email is blocked
  const client = await clientPromise;
  const db = client.db('mainStreetOpportunities');
  const blockedEmailsCollection = db.collection('blockedEmails');
  
  const isBlocked = await blockedEmailsCollection.findOne({ email: normalizedEmail });
  if (isBlocked) {
    // Return a special response that doesn't reveal the block status
    // The frontend will interpret this as a pending account
    return res.status(200).json({
      blocked: true,
      message: 'Your account has been created and is pending admin approval. You will be notified when your account is approved.'
    });
  }
  
  // Find user
  const user = await usersCollection.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Compare passwords
  const passwordMatch = await compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Return user data (excluding password)
  const { password: _, ...userWithoutPassword } = user;
  return res.status(200).json(userWithoutPassword);
}

async function handleAddCommitment(req, res, usersCollection, opportunitiesCollection) {
  const { userId, opportunityId } = req.body;
  
  // Validate input
  if (!userId || !opportunityId) {
    return res.status(400).json({ error: 'Missing userId or opportunityId' });
  }
  
  try {
    console.log('Adding commitment:', { userId, opportunityId });
    
    // Find user - convert string ID to MongoDB ObjectId
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Convert opportunityId to number for consistent comparison
    const opportunityIdNum = parseInt(opportunityId);
    
    // Check if user already has this commitment - handle both string and number formats
    if (user.commitments) {
      for (let i = 0; i < user.commitments.length; i++) {
        if (user.commitments[i] == opportunityId || user.commitments[i] == opportunityIdNum) {
          console.log('User already committed to this opportunity');
          return res.status(409).json({ 
            error: 'You are already committed to this opportunity',
            userCommitments: user.commitments
          });
        }
      }
    }
    
    // Check if user already has 2 commitments
    if (user.commitments && user.commitments.length >= 2) {
      console.log('User already has maximum commitments');
      return res.status(400).json({ 
        error: 'You already have the maximum number of commitments (2)',
        userCommitments: user.commitments
      });
    }
    
    // Find the opportunity
    const opportunity = await opportunitiesCollection.findOne({ id: opportunityIdNum });
    if (!opportunity) {
      console.log('Opportunity not found:', opportunityIdNum);
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    
    // Check if the opportunity is already full
    const totalSpots = opportunity.spotsTotal || opportunity.totalSpots || 0;
    const filledSpots = opportunity.spotsFilled || 0;
    if (filledSpots >= totalSpots) {
      console.log('Opportunity is full:', opportunity.title);
      return res.status(400).json({ error: 'This opportunity is already full' });
    }
    
    // Add commitment to user's commitments array
    const commitments = user.commitments || [];
    commitments.push(opportunityIdNum); // Store as number for consistency
    
    // Update user in database
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { commitments: commitments } }
    );
    
    // Increment the spotsFilled count in the opportunity
    await opportunitiesCollection.updateOne(
      { id: parseInt(opportunityId) },
      { $inc: { spotsFilled: 1 } }
    );
    
    // Return updated user data (excluding password)
    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error adding commitment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}