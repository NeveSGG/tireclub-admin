import React, { FC, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import {
  Toolbar,
  Typography,
  IconButton,
  CircularProgress,
  Stack,
  Skeleton
} from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import { observer } from 'mobx-react-lite';
import Searchbar from 'components/searchbar';

import globalStore from 'store/GlobalStore';
import introspectionStore from 'store/IntrospectionStore';

const drawerWidth = 300;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open'
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));

interface IProps {
  open: boolean;
  setOpen: (newState: boolean) => void;
}

const Header: FC<IProps> = ({ open, setOpen }) => {
  const { introspectionLoading, introspectionRoutesLoading } =
    introspectionStore;
  const { page, pageLoading } = globalStore;
  const openHandler = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  return (
    <AppBar position="fixed" open={open}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={openHandler}
          edge="start"
          sx={{
            marginRight: 5,
            ...(open && { display: 'none' })
          }}
        >
          <MenuIcon />
        </IconButton>
        <Stack
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4
          }}
        >
          {pageLoading ? (
            <Skeleton
              animation="wave"
              variant="text"
              sx={{ fontSize: '2rem', width: 300 }}
            />
          ) : (
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {page}
            </Typography>
          )}

          {introspectionLoading || introspectionRoutesLoading ? (
            <CircularProgress color="info" />
          ) : null}
        </Stack>
        <Searchbar />
      </Toolbar>
    </AppBar>
  );
};

export default observer(Header);
