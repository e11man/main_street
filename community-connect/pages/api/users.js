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
import { sendVerificationEmail } from '../../lib/emailUtils'; // Assuming this will be created

// Helper function to calculate hours from duration string
function calculateHoursFromDuration(duration) {
  if (!duration || typeof duration !== 'string') {
    return 0;
  }

  // Extract numbers from duration string
  const numbers = duration.match(/\d+(?:\.\d+)?/g);
  
  if (!numbers || numbers.length === 0) {
    return 0;
  }

  // Convert to numbers
  const hours = numbers.map(num => parseFloat(num));
  
  // If there's a range (e.g., "2-4 hours"), take the average
  if (hours.length >= 2) {
    const average = (hours[0] + hours[1]) / 2;
    return Math.round(average * 10) / 10; // Round to 1 decimal place
  }
  
  // If there's just one number, return it
  return hours[0];
}

// Helper function to generate a random 6-digit code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to validate and clean up user commitments
async function validateUserCommitments(user, usersCollection, opportunitiesCollection) {
  if (!user.commitments || user.commitments.length === 0) {
    return { validCommitments: [], removedCount: 0 };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for comparison
  
  const validCommitments = [];
  let removedCount = 0;
  
  for (const commitment of user.commitments) {
    let opportunity = null;
    
    // Try to find opportunity by different ID formats
    if (typeof commitment === 'number' || !isNaN(parseInt(commitment))) {
      // Try numeric ID first
      opportunity = await opportunitiesCollection.findOne({ id: parseInt(commitment) });
    }
    
    if (!opportunity && ObjectId.isValid(commitment)) {
      // Try ObjectId if it's a valid ObjectId string
      opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(commitment) });
    }
    
    // Check if opportunity exists and is still valid (not past its date)
    if (opportunity) {
      try {
        const opportunityDate = new Date(opportunity.date);
        opportunityDate.setHours(0, 0, 0, 0);
        
        // Only keep commitments for opportunities that are after today
        if (opportunityDate > today) {
          validCommitments.push(commitment);
        } else {
          console.log(`Removing expired commitment for user ${user._id}: opportunity ${opportunity.title} (date: ${opportunity.date})`);
          removedCount++;
        }
      } catch (error) {
        console.error('Error parsing opportunity date:', opportunity.date, error);
        // If we can't parse the date, remove the commitment to be safe
        removedCount++;
      }
    } else {
      console.log(`Removing invalid commitment for user ${user._id}: commitment ID ${commitment} not found`);
      removedCount++;
    }
  }
  
  return { validCommitments, removedCount };
}

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
    // First try to find by numeric id
    let opportunity = null;
    if (!isNaN(opportunityIdNum)) {
      opportunity = await opportunitiesCollection.findOne({ id: opportunityIdNum });
    }
    
    // If not found and opportunityId looks like MongoDB ObjectId, try _id
    if (!opportunity && ObjectId.isValid(opportunityId)) {
      opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(opportunityId) });
    }
    
    if (opportunity) {
      let updateFilter;
      if (opportunity.id) {
        // Old numeric ID format
        updateFilter = { id: opportunity.id };
      } else {
        // New MongoDB ObjectId format
        updateFilter = { _id: opportunity._id };
      }
      
      await opportunitiesCollection.updateOne(
        updateFilter,
        { $inc: { spotsFilled: -1 } }
      );
      
      // Update metrics for hours served (decrement)
      try {
        const client = await clientPromise;
        const db = client.db('mainStreetOpportunities');
        const metricsCollection = db.collection('metrics');
        const hours = calculateHoursFromDuration(opportunity.duration);
        
        await metricsCollection.updateOne(
          { _id: 'main' },
          { 
            $inc: { hoursServed: -hours },
            $set: { lastUpdated: new Date() }
          }
        );
      } catch (metricsError) {
        console.error('Error updating metrics:', metricsError);
        // Don't fail the entire operation if metrics update fails
      }
    }
    
    // Return updated user data (excluding password)
    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error removing commitment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleTaylorVerify(req, res, usersCollection, taylorVerificationCollection) {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return res.status(400).json({ error: 'Missing email or verification code' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const verificationData = await taylorVerificationCollection.findOne({ email: normalizedEmail });

    if (!verificationData) {
      return res.status(404).json({ error: 'Verification data not found. Please try signing up again.' });
    }

    if (new Date() > new Date(verificationData.codeExpiresAt)) {
      // Optionally delete expired code entry
      await taylorVerificationCollection.deleteOne({ email: normalizedEmail });
      return res.status(400).json({ error: 'Verification code has expired. Please try signing up again.' });
    }

    if (verificationData.verificationCode !== verificationCode) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    // Verification successful, create user in main users collection
    const newUser = {
      email: normalizedEmail,
      password: verificationData.hashedPassword, // Use the stored hashed password
      name: verificationData.name,
      dorm: verificationData.dorm,
      wing: verificationData.wing,
      commitments: [],
      createdAt: new Date()
    };

    // Check if user already exists in users collection (should ideally not happen if flow is correct)
    const existingUser = await usersCollection.findOne({ email: normalizedEmail });
    if (existingUser) {
        // User somehow got created, perhaps a race condition or previous incomplete signup.
        // Decide on behavior: update existing, or error out. For now, error.
        await taylorVerificationCollection.deleteOne({ email: normalizedEmail }); // Clean up verification data
        return res.status(409).json({ error: 'User already exists.' });
    }

    const result = await usersCollection.insertOne(newUser);

    // Update metrics for volunteers connected
    try {
      const client = await clientPromise;
      const db = client.db('mainStreetOpportunities');
      const metricsCollection = db.collection('metrics');
      
      await metricsCollection.updateOne(
        { _id: 'main' },
        { 
          $inc: { volunteersConnected: 1 },
          $set: { lastUpdated: new Date() }
        }
      );
    } catch (metricsError) {
      console.error('Error updating metrics:', metricsError);
      // Don't fail the entire operation if metrics update fails
    }

    // Delete from taylorVerification collection
    await taylorVerificationCollection.deleteOne({ email: normalizedEmail });

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error('Error during Taylor verification:', error);
    return res.status(500).json({ error: 'Internal server error during verification.' });
  }
}

async function handleResendVerificationCode(req, res, taylorVerificationCollection) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email address' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Find existing verification data
    const verificationData = await taylorVerificationCollection.findOne({ email: normalizedEmail });

    if (!verificationData) {
      return res.status(404).json({ error: 'No pending verification found for this email. Please sign up again.' });
    }

    // Check if the current code has expired
    if (new Date() > new Date(verificationData.codeExpiresAt)) {
      // Code has expired, allow immediate resend
      const newVerificationCode = generateVerificationCode();
      const newCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

      await taylorVerificationCollection.updateOne(
        { email: normalizedEmail },
        { 
          $set: { 
            verificationCode: newVerificationCode,
            codeExpiresAt: newCodeExpiresAt,
            lastCodeSentAt: new Date()
          }
        }
      );

      try {
        await sendVerificationEmail(normalizedEmail, newVerificationCode);
        return res.status(200).json({
          message: 'New verification code sent to your email. Please check your inbox and junk/spam folder.'
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
      }
    }

    // Check 2-minute rate limit
    const lastCodeSentAt = verificationData.lastCodeSentAt;
    if (lastCodeSentAt) {
      const timeSinceLastCode = new Date() - new Date(lastCodeSentAt);
      const twoMinutesInMs = 2 * 60 * 1000; // 2 minutes in milliseconds

      if (timeSinceLastCode < twoMinutesInMs) {
        const remainingTime = Math.ceil((twoMinutesInMs - timeSinceLastCode) / 1000); // seconds
        return res.status(429).json({ 
          error: `Please wait ${remainingTime} seconds before requesting a new code.`,
          remainingTime: remainingTime
        });
      }
    }

    // Generate new verification code
    const newVerificationCode = generateVerificationCode();
    const newCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    // Update verification data with new code and timestamp
    await taylorVerificationCollection.updateOne(
      { email: normalizedEmail },
      { 
        $set: { 
          verificationCode: newVerificationCode,
          codeExpiresAt: newCodeExpiresAt,
          lastCodeSentAt: new Date()
        }
      }
    );

    try {
      await sendVerificationEmail(normalizedEmail, newVerificationCode);
      return res.status(200).json({
        message: 'New verification code sent to your email. Please check your inbox and junk/spam folder.'
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
    }

  } catch (error) {
    console.error('Error during code resend:', error);
    return res.status(500).json({ error: 'Internal server error during code resend.' });
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
      } else if (req.query.verifyTaylorEmail === 'true') {
        return await handleTaylorVerify(req, res, usersCollection, db.collection('taylorVerification'));
      } else if (req.query.resendCode === 'true') {
        return await handleResendVerificationCode(req, res, db.collection('taylorVerification'));
      } else if (req.query.validateCommitments === 'true') {
        return await handleValidateCommitments(req, res, usersCollection, opportunitiesCollection);
      } else if (req.query.validateAllCommitments === 'true') {
        return await handleValidateAllCommitments(req, res, usersCollection, opportunitiesCollection);
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
  const { email, password, name, dorm, wing } = req.body;
  
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
      dorm,
      wing,
      commitments: [], // Array to store opportunity IDs (max 2)
      createdAt: new Date()
    };
  
  // Check if email ends with taylor.edu
  if (normalizedEmail.endsWith('taylor.edu')) {
    const verificationCode = generateVerificationCode();
    const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    const taylorVerificationCollection = db.collection('taylorVerification');
    // Ensure TTL index exists on createdAt for taylorVerification collection
    // This should be done once, ideally via a script or MongoDB Atlas UI.
    // For now, we assume it's set up or will be set up.
    // await taylorVerificationCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 15 * 60 });


    // Check if email already pending verification
    const existingTaylorVerification = await taylorVerificationCollection.findOne({ email: normalizedEmail });
    if (existingTaylorVerification) {
      // Check if code has expired
      if (new Date() > new Date(existingTaylorVerification.codeExpiresAt)) {
        // Code expired, allow new signup by deleting old verification
        await taylorVerificationCollection.deleteOne({ email: normalizedEmail });
      } else {
        // Check 2-minute rate limit for resending
        const lastCodeSentAt = existingTaylorVerification.lastCodeSentAt;
        if (lastCodeSentAt) {
          const timeSinceLastCode = new Date() - new Date(lastCodeSentAt);
          const twoMinutesInMs = 2 * 60 * 1000;
          
          if (timeSinceLastCode < twoMinutesInMs) {
            const remainingTime = Math.ceil((twoMinutesInMs - timeSinceLastCode) / 1000);
            return res.status(429).json({ 
              error: `Verification already initiated. Please wait ${remainingTime} seconds before requesting a new code.`,
              remainingTime: remainingTime
            });
          }
        }
        
        // Generate new code and update existing verification
        const newVerificationCode = generateVerificationCode();
        const newCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        
        await taylorVerificationCollection.updateOne(
          { email: normalizedEmail },
          { 
            $set: { 
              verificationCode: newVerificationCode,
              codeExpiresAt: newCodeExpiresAt,
              lastCodeSentAt: new Date(),
              // Update other fields in case user changed them
              name,
              dorm,
              wing,
              hashedPassword
            }
          }
        );
        
        try {
          await sendVerificationEmail(normalizedEmail, newVerificationCode);
          return res.status(202).json({
            requiresTaylorVerification: true,
            message: 'New verification code sent to your Taylor email.'
          });
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError);
          return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
        }
      }
    }

    await taylorVerificationCollection.insertOne({
      email: normalizedEmail,
      name,
      dorm,
      wing,
      hashedPassword,
      verificationCode,
      codeExpiresAt,
      lastCodeSentAt: new Date(), // Track when code was sent for rate limiting
      createdAt: new Date() // For TTL if codeExpiresAt is not directly used for TTL
    });

    try {
      await sendVerificationEmail(normalizedEmail, verificationCode);
      return res.status(202).json({
        requiresTaylorVerification: true,
        message: 'Please check your Taylor email for a verification code to complete your signup. Don\'t forget to check your junk/spam folder.'
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Critical: If email fails, we should probably remove the pending verification
      // or have a retry mechanism. For now, returning an error.
      await taylorVerificationCollection.deleteOne({ email: normalizedEmail });
      return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
    }

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
  
  // Validate and clean up commitments if user has any
  if (user.commitments && user.commitments.length > 0) {
    const opportunitiesCollection = db.collection('opportunities');
    const { validCommitments, removedCount } = await validateUserCommitments(user, usersCollection, opportunitiesCollection);
    
    // Update user's commitments if any were removed
    if (removedCount > 0) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { commitments: validCommitments } }
      );
      
      console.log(`Cleaned up ${removedCount} invalid commitments for user ${user._id}`);
      
      // Fetch updated user data
      const updatedUser = await usersCollection.findOne({ _id: user._id });
      const { password: _, ...userWithoutPassword } = updatedUser;
      return res.status(200).json({
        ...userWithoutPassword,
        commitmentsCleaned: removedCount
      });
    }
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
    
    // Find the opportunity - handle both old numeric IDs and new MongoDB ObjectIds
    let opportunity;
    
    // First try to find by numeric id (for older opportunities)
    if (!isNaN(opportunityIdNum)) {
      opportunity = await opportunitiesCollection.findOne({ id: opportunityIdNum });
    }
    
    // If not found and opportunityId looks like MongoDB ObjectId, try _id
    if (!opportunity && ObjectId.isValid(opportunityId)) {
      opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(opportunityId) });
    }
    
    if (!opportunity) {
      console.log('Opportunity not found:', { opportunityId, opportunityIdNum });
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
    
    // Store the ID in the same format it came in to maintain consistency
    if (opportunity.id) {
      // Old format - store as number
      commitments.push(opportunity.id);
    } else {
      // New format - store as ObjectId string
      commitments.push(opportunity._id.toString());
    }
    
    // Update user in database
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { commitments: commitments } }
    );
    
    // Increment the spotsFilled count in the opportunity
    let updateFilter;
    if (opportunity.id) {
      // Old numeric ID format
      updateFilter = { id: opportunity.id };
    } else {
      // New MongoDB ObjectId format
      updateFilter = { _id: opportunity._id };
    }
    
    await opportunitiesCollection.updateOne(
      updateFilter,
      { $inc: { spotsFilled: 1 } }
    );
    
    // Update metrics for hours served
    try {
      const client = await clientPromise;
      const db = client.db('mainStreetOpportunities');
      const metricsCollection = db.collection('metrics');
      const hours = calculateHoursFromDuration(opportunity.duration);
      
      await metricsCollection.updateOne(
        { _id: 'main' },
        { 
          $inc: { hoursServed: hours },
          $set: { lastUpdated: new Date() }
        }
      );
    } catch (metricsError) {
      console.error('Error updating metrics:', metricsError);
      // Don't fail the entire operation if metrics update fails
    }
    
    // Return updated user data (excluding password)
    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error adding commitment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleValidateCommitments(req, res, usersCollection, opportunitiesCollection) {
  const { userId } = req.body;
  
  // Validate input
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }
  
  try {
    console.log('Validating commitments for user:', userId);
    
    // Find user - convert string ID to MongoDB ObjectId
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Validate commitments using the helper function
    const { validCommitments, removedCount } = await validateUserCommitments(user, usersCollection, opportunitiesCollection);
    
    // Update user's commitments if any were removed
    if (removedCount > 0) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { commitments: validCommitments } }
      );
      
      console.log(`Cleaned up ${removedCount} invalid commitments for user ${user._id}`);
    }
    
    // Fetch updated user data
    const updatedUser = await usersCollection.findOne({ _id: user._id });
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    return res.status(200).json({
      ...userWithoutPassword,
      commitmentsCleaned: removedCount,
      message: removedCount > 0 ? `${removedCount} invalid commitment(s) were removed` : 'All commitments are valid'
    });
  } catch (error) {
    console.error('Error validating commitments:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleValidateAllCommitments(req, res, usersCollection, opportunitiesCollection) {
  try {
    console.log('Validating commitments for all users');
    
    // Find all users with commitments
    const usersWithCommitments = await usersCollection.find({
      commitments: { $exists: true, $not: { $size: 0 } }
    }).toArray();
    
    if (usersWithCommitments.length === 0) {
      return res.status(200).json({
        message: 'No users with commitments found',
        totalUsersProcessed: 0,
        totalCommitmentsCleaned: 0
      });
    }
    
    let totalCommitmentsCleaned = 0;
    const results = [];
    
    for (const user of usersWithCommitments) {
      const { validCommitments, removedCount } = await validateUserCommitments(user, usersCollection, opportunitiesCollection);
      
      if (removedCount > 0) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { commitments: validCommitments } }
        );
        
        totalCommitmentsCleaned += removedCount;
        results.push({
          userId: user._id,
          email: user.email,
          commitmentsCleaned: removedCount
        });
      }
    }
    
    console.log(`Cleaned up ${totalCommitmentsCleaned} invalid commitments across ${results.length} users`);
    
    return res.status(200).json({
      message: `Cleaned up ${totalCommitmentsCleaned} invalid commitment(s) across ${results.length} user(s)`,
      totalUsersProcessed: usersWithCommitments.length,
      totalCommitmentsCleaned,
      results
    });
  } catch (error) {
    console.error('Error validating all commitments:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}