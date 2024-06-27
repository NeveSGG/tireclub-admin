import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Alert, Snackbar } from '@mui/material';
import notificationStore from 'store/NotificationStore';

const notification: FC = () => {
  const { open, message, status } = notificationStore;
  //   const handleClose = (_event?: SyntheticEvent | Event, reason?: string) => {
  const handleClose = () => {
    //  if (reason === 'clickaway') {
    //    return;
    //  }
    notificationStore.close();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={
        status === 'success' || status === 'warning' ? 2000 : null
      }
      onClose={handleClose}
    >
      <Alert severity={status} onClose={handleClose} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default observer(notification);
