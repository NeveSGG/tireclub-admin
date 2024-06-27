import React, { FC, useCallback, SyntheticEvent } from 'react';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import {
  List,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Tooltip,
  Tab
} from '@mui/material';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import { ChevronLeft } from '@mui/icons-material';
import Icon from '@mui/material/Icon';
import Account from 'components/account';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import introspectionStore from 'store/IntrospectionStore';
import globalStore from 'store/GlobalStore';
import mainStore from 'store/MainStore';

const drawerWidth = '300px';

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: 'hidden'
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`
  }
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  direction: 'rtl',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme)
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme)
  })
}));

const a11yProps = (index: number) => {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`
  };
};

interface IProps {
  open: boolean;
  setOpen: (newState: boolean) => void;
}

const Sidebar: FC<IProps> = ({ open, setOpen }) => {
  const { introspectionRoutes, introspectionRoutesLoading } =
    introspectionStore;
  const { path } = globalStore;
  const navigate = useNavigate();

  const handleDrawerClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleMenuItemClick = useCallback(
    (url: string) => () => {
      mainStore.clearSearchString();
      navigate(url);
    },
    [navigate]
  );

  return (
    <Drawer variant="permanent" sx={{ width: 'min-content' }} open={open}>
      <DrawerHeader
        sx={{
          position: 'fixed',
          height: '64px',
          borderBottom: '1px solid #B9C6DF',
          background: '#F3F5F6',
          opacity: '1',
          zIndex: 1,
          width: '100%',
          maxWidth: '300px'
        }}
      >
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeft />
        </IconButton>
        <Account />
      </DrawerHeader>

      {introspectionRoutesLoading || introspectionRoutes.length === 0 ? (
        <List
          sx={{ mt: '64px', pt: 0 }}
          component="nav"
          aria-labelledby="catalog-list-nav"
        >
          {Array.from({ length: 10 }, (val, ind) => ind).map((el) => (
            <ListItem key={el} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center'
                  }}
                >
                  <Skeleton variant="rounded" width={30} height={30} />
                </ListItemIcon>
                <ListItemText
                  primary={<Skeleton variant="text" width={206} />}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Tabs
          orientation="vertical"
          variant="scrollable"
          scrollButtons
          value={
            introspectionRoutes.findIndex((v) => v.url === path) > -1
              ? introspectionRoutes.findIndex((v) => v.url === path)
              : 0
          }
          onChange={(_e: SyntheticEvent, newValue: number) => {
            handleMenuItemClick(introspectionRoutes[newValue].url);
          }}
          aria-label="Sidebar tabs"
          sx={{
            borderRight: 0,
            borderColor: 'divider',
            mt: '64px',
            [`& .${tabsClasses.scrollButtons}`]: {
              height: '47px',
              borderTop: '1px solid #B9C6DF',
              borderBottom: '1px solid #B9C6DF',
              '&.Mui-disabled': { opacity: 0.3 }
            }
          }}
        >
          {introspectionRoutes.map((el, ind) => (
            <Tooltip
              // eslint-disable-next-line react/no-array-index-key
              key={ind}
              title={el.name}
              open={open ? false : undefined}
              placement="right"
            >
              <Tab
                key={el.key}
                label={open ? el.name : ''}
                sx={{
                  display: el.in_admin ? 'flex' : 'none',
                  textTransform: 'none',
                  textAlign: 'start',
                  minWidth: 0,
                  minHeight: '40px',
                  fontSize: '1.05rem',
                  gap: 2,
                  flexDirection: 'row',
                  alignItems: 'center',
                  m: 0,
                  justifyContent: 'flex-start',
                  '&>.MuiTab-iconWrapper': { m: 0 }
                }}
                icon={<Icon>{el.icon}</Icon>}
                onClick={handleMenuItemClick(el.url)}
                {...a11yProps(ind)}
              />
            </Tooltip>
          ))}
        </Tabs>
      )}
      <Divider />
    </Drawer>
  );
};

export default observer(Sidebar);
