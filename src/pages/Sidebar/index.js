import React from "react";
import PropTypes from "prop-types";
import { Box, Button, Typography, Card, CardMedia, CardContent } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import "./index.css"; // Ensure you have appropriate styles
import img1 from "../../assets/XE9A3446-1536x1024.jpg";
import img2 from "../../assets/Ethiopia-2880.jpeg"; // Replace with your image paths
import img3 from "../../assets/2716244.jpg"; // Replace with your image paths

const cafesData = [
  {
    _id: "1",
    cafe: "Cambridge",
    description: "Enjoy a relaxing atmosphere with great coffee and pastries.",
    image: img1,
  },
  {
    _id: "2",
    cafe: "Bingham",
    description: "A cozy spot with a variety of teas and delicious sandwiches.",
    image: img2,
  },
  {
    _id: "3",
    cafe: "Savor",
    description: "Perfect for brunch with friends, serving a wide range of dishes.",
    image: img3,
  },
];

const CafeHomepage = ({ onCafeSelect }) => {
  const handleCafeSelect = (cafe) => {
    onCafeSelect(cafe);
    const cafeName = cafe.cafe.toLowerCase().replace(/\s+/g, ""); // Convert to lowercase and remove spaces
    window.location.href = `/${cafeName}`; // Navigate to the new route based on cafe name
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 4 }}>
      <Typography variant="h5" sx={{ marginBottom: 10, fontWeight: 'bold', color: '#FE8C00', fontFamily: "Montserrat" }}>
        PLease Choose Your Location
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, fontFamily: "Montserrat" }}>
        {cafesData.map((cafe) => (
          <Card key={cafe._id} sx={{ width: 300, borderRadius: 4, boxShadow: 3, transition: '0.3s', '&:hover': { transform: 'scale(1.05)' }, fontFamily: "Montserrat", display: "flex", flexDirection: "column" }}>
            <CardMedia
              component="img"
              height="180"
              image={cafe.image}
              alt={cafe.cafe}
            />
            <CardContent sx={{ backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', fontFamily: "Montserrat" }}>
                {cafe.cafe}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 1 , fontFamily: "Montserrat", fontWeight:"500"}}>
                {cafe.description}
              </Typography>
              <Button
                onClick={() => handleCafeSelect(cafe)}
                variant="contained"
                startIcon={<StarIcon />}
                sx={{
                  marginTop: 1,
                  width: "100%",
                  backgroundColor: "#FE8C00",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#D97D00",
                  },
                }}
              >
                Select
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

CafeHomepage.propTypes = {
  onCafeSelect: PropTypes.func.isRequired,
};

export default CafeHomepage;
