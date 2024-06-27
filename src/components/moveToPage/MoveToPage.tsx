import React, {
  FC,
  useState,
  MouseEvent,
  useCallback,
  ChangeEvent,
  KeyboardEvent
} from 'react';
import {
  Menu,
  Fade,
  MenuItem,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import MoveDownIcon from '@mui/icons-material/MoveDown';

import { observer } from 'mobx-react-lite';

import mainStore from 'store/MainStore';
import globalStore from 'store/GlobalStore';

interface IProps {
  maxPage: number;
  currentPage: number;
  item: any;
}

const MoveToPage: FC<IProps> = ({ maxPage, currentPage, item }) => {
  const { path } = globalStore;
  const { list } = mainStore;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [value, setValue] = useState<number>(1);
  const [helper, setHelper] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const submit = (val: number) => {
    if (val > maxPage) {
      setError(true);
      setHelper(`Страница не должна быть больше ${maxPage}`);
    } else if (val === currentPage) {
      setError(true);
      setHelper(`Елемент уже находится на странице ${currentPage}`);
    } else if (val < 1) {
      setError(true);
      setHelper('Страница не должна быть меньше 1');
    } else {
      mainStore.moveItem(path.slice(1), item.id, item, value, {
        page: list.current_page,
        paginate: true,
        perpage: list.per_page,
        lastpage: list.last_page
      });
      setAnchorEl(null);
    }
  };

  const onValueChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const regex = /^[0-9\b]+$/;
      if (e.target.value === '' || regex.test(e.target.value)) {
        setValue(parseInt(e.target.value || '0', 10));
        setError(false);
        setHelper('');
      }
    },
    []
  );

  const onSubmit = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter') {
        submit(value);
      }
    },
    [value]
  );

  const onSubmitClick = useCallback(() => {
    submit(value);
  }, [value]);

  return (
    <>
      <IconButton
        id="fade-button"
        aria-controls={open ? 'fade-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <MoveDownIcon />
      </IconButton>
      <Menu
        id="fade-menu"
        MenuListProps={{
          'aria-labelledby': 'fade-button'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <MenuItem dense>
          <TextField
            id="outlined-basic"
            size="small"
            label="Номер страницы"
            helperText={helper}
            error={error}
            variant="outlined"
            value={value}
            onChange={onValueChange}
            onKeyDown={onSubmit}
            InputProps={{
              inputMode: 'numeric',
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={onSubmitClick} size="small">
                    <MoveDownIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};

export default observer(MoveToPage);
