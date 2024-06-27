import React, { FC, useState, useCallback, memo } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

interface IConfirmationProps {
  openButtonText: string;
  titleText: string;
  plainText?: string;
  onAgree?: () => void;
  onDisagree?: () => void;
  agreeButtonText: string;
  disagreeButtonText?: string;
}

const Confirmation: FC<IConfirmationProps> = ({
  openButtonText,
  titleText,
  plainText,
  onAgree,
  onDisagree,
  agreeButtonText,
  disagreeButtonText
}) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleClickOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleAgree = useCallback(() => {
    setOpen(false);
    if (onAgree) onAgree();
  }, [onAgree]);

  const handleDisagree = useCallback(() => {
    setOpen(false);
    if (onDisagree) onDisagree();
  }, [onDisagree]);

  return (
    <>
      <Button variant="outlined" onClick={handleClickOpen} size="small">
        {openButtonText}
      </Button>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleDisagree}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">{titleText}</DialogTitle>
        {plainText && (
          <DialogContent>
            <DialogContentText>{plainText}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions>
          {disagreeButtonText && (
            <Button autoFocus onClick={handleDisagree} color="info">
              {disagreeButtonText}
            </Button>
          )}
          <Button onClick={handleAgree} autoFocus>
            {agreeButtonText || 'Подтвердить'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default memo(Confirmation);
