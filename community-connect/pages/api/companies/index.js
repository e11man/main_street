/**
 * API Endpoint for Companies
 * -----------------------------
 * 
 * This API endpoint connects to MongoDB and provides company authentication and management functionality.
 * 
 * ENDPOINT USAGE:
 * - POST /api/companies?signup=true: Creates a new company account
 * - POST /api/companies?login=true: Authenticates a company and returns company data
 * - GET /api/companies: Retrieves company data (requires authentication)
 */

import clientPromise from '../../../lib/mongodb';
import { hash, compare } from 'bcrypt';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Connect to MongoDB
  const client = await clientPromise;
  const db = client.db('mainStreetOpportunities');
  const companiesCollection = db.collection('companies');
  
  // Handle different HTTP methods
  if (req.method === 'POST') {
    // Handle signup
    if (req.query.signup === 'true') {
      return handleSignup(req, res, companiesCollection);
    }
    
    // Handle login
    if (req.query.login === 'true') {
      return handleLogin(req, res, companiesCollection);
    }
  }
  
  if (req.method === 'GET') {
    // Get company by ID
    const { id } = req.query;
    if (id) {
      try {
        const company = await companiesCollection.findOne({ _id: new ObjectId(id) });
        if (!company) {
          return res.status(404).json({ error: 'Company not found' });
        }
        
        // Return company data (excluding password)
        const { password: _, ...companyWithoutPassword } = company;
        return res.status(200).json(companyWithoutPassword);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch company data' });
      }
    }
    
    // Get all companies
    try {
      const companies = await companiesCollection.find({}).toArray();
      // Remove passwords from all companies
      const companiesWithoutPasswords = companies.map(company => {
        const { password: _, ...companyWithoutPassword } = company;
        return companyWithoutPassword;
      });
      return res.status(200).json(companiesWithoutPasswords);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch companies' });
    }
  }
  
  // Handle PUT request for updating company information
  if (req.method === 'PUT') {
    try {
      const { id, name, description, website, phone } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Company ID is required' });
      }
      
      // Prepare update data
      const updateData = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (website) updateData.website = website;
      if (phone) updateData.phone = phone;
      
      // Update company in database
      const result = await companiesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Company not found' });
      }
      
      // Get updated company data
      const updatedCompany = await companiesCollection.findOne({ _id: new ObjectId(id) });
      const { password: _, ...companyWithoutPassword } = updatedCompany;
      
      return res.status(200).json(companyWithoutPassword);
    } catch (error) {
      console.error('Error updating company:', error);
      return res.status(500).json({ error: 'Failed to update company information' });
    }
  }
  
  // Return 405 for unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleSignup(req, res, companiesCollection) {
  const { name, email, password, description, website, phone } = req.body;
  
  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Check if company already exists in companies collection
  const existingCompany = await companiesCollection.findOne({ email });
  if (existingCompany) {
    return res.status(409).json({ error: 'Company with this email already exists' });
  }
  
  // Check if company already exists in pending companies collection
  const client = await clientPromise;
  const db = client.db('mainStreetOpportunities');
  const pendingCompaniesCollection = db.collection('pendingCompanies');
  
  const existingPendingCompany = await pendingCompaniesCollection.findOne({ email });
  if (existingPendingCompany) {
    return res.status(409).json({ error: 'Company with this email is already pending approval' });
  }
  
  // Hash password
  const hashedPassword = await hash(password, 10);
  
  // Create new company object
  const newCompany = {
    name,
    email,
    password: hashedPassword,
    description: description || '',
    website: website || '',
    phone: phone || '',
    opportunities: [], // Array to store opportunity IDs created by this company
    createdAt: new Date(),
    approved: false // Companies require approval
  };
  
  // Insert new company into pending companies collection
  try {
    const result = await pendingCompaniesCollection.insertOne(newCompany);
    
    // Return company data (excluding password)
    const { password: _, ...companyWithoutPassword } = newCompany;
    return res.status(201).json({
      ...companyWithoutPassword,
      pending: true,
      message: 'Your company account has been submitted for approval. You will be notified when it is approved.'
    });
  } catch (error) {
    console.error('Error creating pending company:', error);
    return res.status(500).json({ error: 'Failed to create company account' });
  }
}

async function handleLogin(req, res, companiesCollection) {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  
  // Find company
  const company = await companiesCollection.findOne({ email });
  if (!company) {
    // Check if company is in pending companies collection
    const client = await clientPromise;
    const db = client.db('mainStreetOpportunities');
    const pendingCompaniesCollection = db.collection('pendingCompanies');
    
    const pendingCompany = await pendingCompaniesCollection.findOne({ email });
    if (pendingCompany) {
      // Compare passwords for pending company
      const passwordMatch = await compare(password, pendingCompany.password);
      if (passwordMatch) {
        return res.status(403).json({ 
          error: 'Your company account is pending approval by an administrator',
          pending: true
        });
      }
    }
    
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Check if company is approved
  if (!company.approved) {
    return res.status(403).json({ 
      error: 'Your company account is pending approval by an administrator',
      pending: true
    });
  }
  
  // Compare passwords
  const passwordMatch = await compare(password, company.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Return company data (excluding password)
  const { password: _, ...companyWithoutPassword } = company;
  return res.status(200).json(companyWithoutPassword);
}