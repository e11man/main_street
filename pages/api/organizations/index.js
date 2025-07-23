/**
 * API Endpoint for Organizations
 * 
 * This API endpoint connects to MongoDB and provides organization authentication and management functionality.
 * 
 * Endpoints:
 * - POST /api/organizations?signup=true: Creates a new organization account
 * - POST /api/organizations?login=true: Authenticates an organization and returns organization data
 * - GET /api/organizations: Retrieves organization data (requires authentication)
 */

import { hash, compare } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const organizationsCollection = db.collection('companies');
    
    // Handle different HTTP methods
    if (req.method === 'POST') {
      // Handle signup
      if (req.query.signup === 'true') {
        return handleSignup(req, res, organizationsCollection);
      }
      
      // Handle login
      if (req.query.login === 'true') {
        return handleLogin(req, res, organizationsCollection);
      }
    }
    
    if (req.method === 'GET') {
      // Get organization by ID
      const { id } = req.query;
      if (id) {
        try {
          const organization = await organizationsCollection.findOne({ _id: new ObjectId(id) });
          if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
          }
          
          // Return organization data (excluding password)
          const { password: _, ...organizationWithoutPassword } = organization;
          
          return res.status(200).json(organizationWithoutPassword);
        } catch (error) {
          return res.status(500).json({ error: 'Failed to fetch organization data' });
        }
      }
      
      // Get all organizations
      try {
        const organizations = await organizationsCollection.find({}).toArray();
        // Remove passwords from all organizations
        const organizationsWithoutPasswords = organizations.map(organization => {
          const { password: _, ...organizationWithoutPassword } = organization;
          return organizationWithoutPassword;
        });
        
        return res.status(200).json(organizationsWithoutPasswords);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch organizations' });
      }
    }
    
    // Handle PUT request for updating organization information
    if (req.method === 'PUT') {
      try {
        const { id, name, description, website, phone } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Organization ID is required' });
        }
        
        // Build update object
        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (website) updateData.website = website;
        if (phone) updateData.phone = phone;
        
        // Update organization in database
        const result = await organizationsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: 'Organization not found' });
        }
        
        // Get updated organization data
        const updatedOrganization = await organizationsCollection.findOne({ _id: new ObjectId(id) });
        const { password: _, ...organizationWithoutPassword } = updatedOrganization;
        
        return res.status(200).json(organizationWithoutPassword);
      } catch (error) {
        console.error('Error updating organization:', error);
        return res.status(500).json({ error: 'Failed to update organization information' });
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Organizations API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleSignup(req, res, organizationsCollection) {
  const { name, email, password, description, website, phone } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  
  try {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if organization already exists in organizations collection
    const existingOrganization = await organizationsCollection.findOne({ email: normalizedEmail });
    if (existingOrganization) {
      return res.status(409).json({ error: 'Organization with this email already exists' });
    }
    
    // Check if organization already exists in pending organizations collection
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const pendingOrganizationsCollection = db.collection('pendingCompanies');
    
    const existingPendingOrganization = await pendingOrganizationsCollection.findOne({ email: normalizedEmail });
    if (existingPendingOrganization) {
      return res.status(409).json({ error: 'Organization with this email is already pending approval' });
    }
    
    // Hash password
    const hashedPassword = await hash(password, 12);
    
    // Create new organization object
    const newOrganization = {
      name,
      email: normalizedEmail,
      password: hashedPassword,
      description: description || '',
      website: website || '',
      phone: phone || '',
      opportunities: [], // Array to store opportunity IDs created by this organization
      createdAt: new Date(),
      approved: false, // Organizations require approval
      // Default messaging preference
      chatNotificationFrequency: 'immediate'
    };
    
    // Insert new organization into pending organizations collection
    const result = await pendingOrganizationsCollection.insertOne(newOrganization);
    
    // Return organization data (excluding password)
    const { password: _, ...organizationWithoutPassword } = newOrganization;
    
    return res.status(201).json({
      ...organizationWithoutPassword,
      message: 'Your organization account has been submitted for approval. You will be notified when it is approved.'
    });
  } catch (error) {
    console.error('Error creating pending organization:', error);
    return res.status(500).json({ error: 'Failed to create organization account' });
  }
}

async function handleLogin(req, res, organizationsCollection) {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Find organization
    const organization = await organizationsCollection.findOne({ email: normalizedEmail });
    if (!organization) {
      // Check if organization is in pending organizations collection
      const client = await clientPromise;
      const db = client.db('mainStreetOpportunities');
      const pendingOrganizationsCollection = db.collection('pendingCompanies');
      
      const pendingOrganization = await pendingOrganizationsCollection.findOne({ email: normalizedEmail });
      if (pendingOrganization) {
        // Compare passwords for pending organization
        const passwordMatch = await compare(password, pendingOrganization.password);
        if (passwordMatch) {
          return res.status(403).json({ 
            error: 'Your organization account is pending approval by an administrator',
            pending: true
          });
        }
      }
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if organization is approved
    if (!organization.approved) {
      return res.status(403).json({ 
        error: 'Your organization account is pending approval by an administrator',
        pending: true
      });
    }
    
    // Compare passwords
    const passwordMatch = await compare(password, organization.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Return organization data (excluding password)
    const { password: _, ...organizationWithoutPassword } = organization;
    return res.status(200).json(organizationWithoutPassword);
  } catch (error) {
    console.error('Organization login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}