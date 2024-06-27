import React, { FC, useCallback, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import {
  ListItemText,
  ListItem,
  IconButton,
  Stack,
  Skeleton
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import MoveToPage from 'components/moveToPage';

import mainStore from 'store/MainStore';
import globalStore from 'store/GlobalStore';
import notificationStore from 'store/NotificationStore';

import {
  getResourceName,
  makeClassificationLabel,
  randomPercent
} from 'helpers/functions';

export type DraggableListItemProps = {
  item: any;
  index: number;
  maxPage: number;
  currentPage: number;
};

const DraggableListItem: FC<DraggableListItemProps> = ({
  item,
  index,
  maxPage,
  currentPage
}) => {
  const { listLoading, deletingItem, updatingItem, list } = mainStore;
  const { path } = globalStore;
  const navigate = useNavigate();
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const onDelete = useCallback(() => {
    const resp = mainStore.deleteItem(path.slice(1), item.id, {
      page: list.current_page,
      paginate: true,
      perpage: list.per_page,
      lastpage: list.last_page
    });

    resp.then((val) => {
      if (val.isOk) {
        notificationStore.success('Элемент успешно удалён');
        setIsDeleted(true);
      }
    });
  }, [path, item, index]);

  const onClick = useCallback(() => {
    navigate(`${path}/${item.id}`);
  }, [item, path]);
  return (
    <Draggable draggableId={item.id} index={index} key={item.id}>
      {(provided, snapshot) => (
        <ListItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            backgroundColor: snapshot.isDragging
              ? 'background.paper'
              : 'background.default',
            border: '1px solid #ffffff',
            borderColor: 'divider',
            display: isDeleted ? 'none' : 'block',
            transition: 'color .2s linear',
            '&:hover': {
              color: '#EF353D'
            }
          }}
          dense
          secondaryAction={
            <Stack display="flex" flexDirection="row">
              <MoveToPage
                maxPage={maxPage}
                currentPage={currentPage}
                item={item}
              />
              <IconButton onClick={onDelete}>
                <DeleteOutlineIcon color="error" />
              </IconButton>
            </Stack>
          }
        >
          {listLoading ||
          deletingItem === item.id ||
          updatingItem === item.id ? (
            <Stack
              sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
            >
              <Skeleton
                variant="text"
                sx={{ fontSize: '1.165rem', width: `${randomPercent(60)}%` }}
              />
              <Skeleton
                variant="text"
                sx={{ fontSize: '1rem', width: `${randomPercent(30)}%` }}
              />
            </Stack>
          ) : (
            <ListItemText
              primary={getResourceName(item)}
              onClick={onClick}
              secondary={
                (item.metadata?.classification?.instance &&
                  makeClassificationLabel(
                    item.metadata.classification.instance
                  )) ||
                getResourceName(item)
              }
              primaryTypographyProps={{
                style: {
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }
              }}
              secondaryTypographyProps={{
                style: {
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }
              }}
              sx={{
                cursor: 'pointer',
                width: 'calc(100% - 60px)'
              }}
            />
          )}
        </ListItem>
      )}
    </Draggable>
  );
};

export default observer(DraggableListItem);
