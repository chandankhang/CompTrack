import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Typography, Box } from '@mui/material';

const SuccessStories = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000
  };

  const stories = [
    {
      text: '"CompTrack helped me fix the water issue in my hostel within 2 days!"',
      author: 'Priya, Student'
    },
    {
      text: '"I reported a train cleanliness issue, and it was resolved quickly!"',
      author: 'Rahul, Traveler'
    },
    {
      text: '"The dust problem in my office was solved thanks to CompTrack!"',
      author: 'Anjali, Employee'
    }
  ];

  return (
    <Box mt={4} sx={{ width: '80%', margin: '0 auto' }}>
      <Typography variant="h6" color="white" gutterBottom>
        Success Stories
      </Typography>
      <Slider {...settings}>
        {stories.map((story, index) => (
          <div key={index}>
            <Typography variant="body1" color="white">
              {story.text}
            </Typography>
            <Typography variant="body2" color="white">
              - {story.author}
            </Typography>
          </div>
        ))}
      </Slider>
    </Box>
  );
};

export default SuccessStories;