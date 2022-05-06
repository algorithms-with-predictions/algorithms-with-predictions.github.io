import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';

const pages = [
    { "name": 'Paper List', "href": "/" }, { "name": 'Further Material', "href": "/further" }, , { "name": 'About', "href": "/about" }
];


const MyAppBar = () => {
  
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
          >
            Algorithms with Predictions
          </Typography>
           
              {pages.map((page) => (             
                  <Button href={page.href} color="inherit" textAlign="center">{page.name}</Button>               
              ))}
          
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default MyAppBar;
