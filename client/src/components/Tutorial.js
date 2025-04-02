import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Tutorial = () => {
  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h3" align="center" sx={{ fontWeight: 600, mb: 4 }}>
        CompTrack Tutorial
      </Typography>
      <Box sx={{ textAlign: 'center' }}>
        <iframe
          width="100%"
          height="500"
          src="https://www.youtube.com/embed/Iy2lU0w9wM0?si=wcMbzhu_uQKNCyqM" // Replace with your tutorial video URL
          title="CompTrack Tutorial"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </Box>
    </Container>
  );
};

export default Tutorial;