/**
 * Metrics Utility Functions
 * -------------------------
 * 
 * This file provides utility functions for calculating and updating metrics
 * including hours served, volunteer counts, and project statistics.
 */

/**
 * Calculate hours from opportunity duration string
 * @param {string} duration - Duration string (e.g., "2-4 hours", "3 hours", "1-2 hours")
 * @returns {number} - Average hours (rounded to 1 decimal place)
 */
export function calculateHoursFromDuration(duration) {
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

/**
 * Update metrics when a user signs up for an opportunity
 * @param {string} opportunityId - The opportunity ID
 * @param {string} userId - The user ID
 * @param {string} duration - The opportunity duration
 */
export async function updateMetricsOnSignup(opportunityId, userId, duration) {
  try {
    const hours = calculateHoursFromDuration(duration);
    
    const response = await fetch('/api/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signup',
        opportunityId,
        userId,
        hours
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update metrics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating metrics on signup:', error);
    throw error;
  }
}

/**
 * Update metrics when a user cancels an opportunity
 * @param {string} opportunityId - The opportunity ID
 * @param {string} userId - The user ID
 * @param {string} duration - The opportunity duration
 */
export async function updateMetricsOnCancel(opportunityId, userId, duration) {
  try {
    const hours = calculateHoursFromDuration(duration);
    
    const response = await fetch('/api/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'cancel',
        opportunityId,
        userId,
        hours
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update metrics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating metrics on cancel:', error);
    throw error;
  }
}

/**
 * Fetch current metrics from the API
 * @returns {Promise<Object>} - The current metrics
 */
export async function fetchMetrics() {
  try {
    const response = await fetch('/api/metrics');
    
    if (!response.ok) {
      throw new Error('Failed to fetch metrics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching metrics:', error);
    // Return default metrics if fetch fails
    return {
      volunteersConnected: 0,
      projectsCompleted: 0,
      organizationsInvolved: 0,
      hoursServed: 0
    };
  }
}

/**
 * Recalculate all metrics from scratch
 * @returns {Promise<Object>} - The recalculated metrics
 */
export async function recalculateMetrics() {
  try {
    const response = await fetch('/api/metrics', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to recalculate metrics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error recalculating metrics:', error);
    throw error;
  }
}