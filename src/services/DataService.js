// src/services/DataService.js
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3000/api';
const socket = io('http://localhost:3000');

export const DataService = {
  // Get all teams
  getTeams: async () => {
    try {
      const response = await axios.get(`${API_URL}/teams`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },
  
  // Add a new team
  addTeam: async (team) => {
    try {
      const response = await axios.post(`${API_URL}/teams`, team);
      return response.data;
    } catch (error) {
      console.error('Error adding team:', error);
      throw error;
    }
  },
  
  // Update an existing team
  updateTeam: async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_URL}/teams/${id}`, updatedData);
      return response.data;
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  },
  
  // Delete a team
  deleteTeam: async (id) => {
    try {
      await axios.delete(`${API_URL}/teams/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  },
  
  // Subscribe to real-time updates
  subscribeToUpdates: (callback) => {
    socket.on('teams-updated', (updatedTeams) => {
      callback(updatedTeams);
    });
    
    return () => {
      socket.off('teams-updated');
    };
  }
};

export default DataService;