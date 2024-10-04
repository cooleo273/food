  import React, { useState } from "react";
  import PropTypes from "prop-types";
  import { styled, useTheme } from "@mui/material/styles";
  import {
    Drawer,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Typography,
    Divider,
    Box,
  } from "@mui/material";
  import MenuIcon from "@mui/icons-material/Menu";
  import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
  import ChevronRightIcon from "@mui/icons-material/ChevronRight";
  import StarIcon from "@mui/icons-material/Star";
  import "./index.css";

  const drawerWidth = 280;

  // Primary and Accent Color Application
  const primaryColor = "#FE8C00"; // Bold Orange for buttons
  const backgroundColor = "#F5F5F5"; // Light Gray for background
  const accentColor = "#4CAF50"; // Turquoise Green for hover and accents
  const textColor = "#2D2D2D"; // Dark Charcoal for text
  const highlightColor = "#FFC107"; // Warm Yellow for highlights like stars

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(0, 1),
    backgroundColor: primaryColor, // Use primary color for header background
    color: "#fff", // White text
    ...theme.mixins.toolbar,
    borderBottom: "1px solid #E64A19", // Slightly darker shade for the border
  }));

  const StyledDrawer = styled(Drawer)(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: drawerWidth,
      backgroundColor: backgroundColor, // Use light gray for background
      color: textColor, // Dark Charcoal for text
      boxShadow: "2px 0 15px rgba(0, 0, 0, 0.3)", // Smooth shadow
      borderRadius: "0 10px 10px 0", // Rounded corner for a modern look
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
  
      // Full width for screens less than 468px
      [theme.breakpoints.down("sm")]: {
        width: "100%", // Make it full width
        borderRadius: 0, // Remove border radius for a full-screen drawer look
      },
    },
  }));
  

  const StyledListItem = styled(ListItem)(({ theme }) => ({
      "&:hover": {
        backgroundColor: accentColor, // Turquoise hover effect
        transition: "background-color 0.3s ease",
        cursor: "pointer",
        "& .MuiListItemText-root": {
          color: "#fff", // Text turns white on hover
        },
        "& svg": {
          color: "#fff", // Optionally, you can make the star icon white on hover as well
        },
      },
      "& .MuiListItemText-root": {
        fontWeight: 500,
        color: textColor, // Ensure the default text color is applied when not hovered
      },
      "& svg": {
        color: highlightColor, // Warm Yellow for the icon (default)
      },
    }));
    

  const CafeSidebar = ({ cafes, onCafeSelect, onToggleDrawer }) => {
    const theme = useTheme();
    const [isDrawerOpen, setIsDrawerOpen] = useState(true); // Initially set to false (closed)

    const toggleDrawer = () => {
      setIsDrawerOpen(!isDrawerOpen);
      onToggleDrawer(!isDrawerOpen); // Notify parent component of drawer state change
    };

    return (
      <Box sx={{ display: "flex" }}>
        {/* Conditional rendering of the menu and close buttons */}
        {!isDrawerOpen ? (
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{
              position: "fixed",
              top: 16,
              left: 16,
              zIndex: 1301,
              backgroundColor: primaryColor,
              color: "#fff", // Use white text for contrast
              "&:hover": {
                backgroundColor: "#E64A19", // Slightly darker on hover
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        ) : null}

        {/* Drawer Component */}
        <StyledDrawer
          variant="persistent"
          anchor="left"
          open={isDrawerOpen}
        >
          <DrawerHeader>
            <Typography variant="h6" noWrap>
              Cafes
            </Typography>
            <IconButton onClick={toggleDrawer}>
              {theme.direction === "ltr" ? (
                <ChevronLeftIcon style={{ color: "#fff" }} />
              ) : (
                <ChevronRightIcon style={{ color: "#fff" }} />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider sx={{ backgroundColor: "#E64A19" }} />

          {/* Cafe List */}
          <List>
            {cafes.map((cafe) => (
              <StyledListItem
                key={cafe._id}
                onClick={() => {
                  onCafeSelect(cafe);
                  toggleDrawer(); // Close drawer after selection if needed
                }}
              >
                <StarIcon />
                <ListItemText
                  primary={cafe.cafe}
                  sx={{ marginLeft: 2, color: textColor, padding: 0 }} // Dark Charcoal for list text
                />
              </StyledListItem>
            ))}
          </List>
        </StyledDrawer>
      </Box>
    );
  };

  CafeSidebar.propTypes = {
    cafes: PropTypes.array.isRequired,
    onCafeSelect: PropTypes.func.isRequired,
    onToggleDrawer: PropTypes.func.isRequired, // Callback to notify the parent component
  };

  export default CafeSidebar;
