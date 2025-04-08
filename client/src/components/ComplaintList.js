import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Box, List, ListItem, ListItemText, Divider } from '@mui/material';

const ComplaintList = ({ userId }) => {
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`https://comptrack.onrender.com/api/complaints/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setComplaints(res.data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
        setError(error.response?.data?.message || 'Failed to fetch complaints');
      }
    };

    if (userId) {
      fetchComplaints();
    }
  }, [userId]);

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h5" gutterBottom>
        Your Complaints
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      {complaints.length === 0 ? (
        <Typography>No complaints found.</Typography>
      ) : (
        <List>
          {complaints.map((complaint) => (
            <div key={complaint._id}>
              <ListItem>
                <ListItemText
                  primary={`Complaint #${complaint.complaintNumber}: ${complaint.title}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        Description: {complaint.description}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Category: {complaint.category} | Urgency: {complaint.urgency} | Status: {complaint.status}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Location: {complaint.location} | Created: {new Date(complaint.createdAt).toLocaleDateString()}
                      </Typography>
                      {complaint.imageUrl && (
                        <>
                          <br />
                          <Typography component="span" variant="body2">
                            Image: <a href={complaint.imageUrl} target="_blank" rel="noopener noreferrer">View Image</a>
                          </Typography>
                        </>
                      )}
                    </>
                  }
                />
              </ListItem>
              <Divider />
            </div>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ComplaintList;