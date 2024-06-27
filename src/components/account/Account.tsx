import React, { FC, useState, useCallback } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useSanctum } from 'react-sanctum';
import { useNavigate } from 'react-router-dom';
import cookies from 'cookies';
import instance, { webInstance } from 'api/utilities/axios';

const Account: FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { signOut } = useSanctum();
  const navigate = useNavigate();

  const handleMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    cookies.remove('token');
    delete webInstance.defaults.headers.common.Authorization;
    delete instance.defaults.headers.common.Authorization;
    signOut().then(() => {
      navigate('/signIn');
    });
    setAnchorEl(null);
  }, []);

  return (
    <>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <AccountCircle />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        keepMounted
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        <MenuItem onClick={handleClose}>Выход</MenuItem>
      </Menu>
    </>
  );
};

export default Account;
