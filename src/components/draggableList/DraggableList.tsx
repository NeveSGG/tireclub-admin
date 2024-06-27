import React, { FC } from 'react';
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder
} from 'react-beautiful-dnd';
import { List, Box, Typography } from '@mui/material';
import DraggableListItem from 'components/draggableListItem';
import mainStore from 'store/MainStore';
import { observer } from 'mobx-react-lite';
import { IPaginatedListing } from 'types/types';

export type DraggableListProps = {
  onDragEnd: OnDragEndResponder;
  currentPage: number;
  maxPage: number;
};

interface OutputProps {
  list: IPaginatedListing<any[]>;
  loading: boolean;
  currentPage: number;
  perPage: number;
  maxPage: number;
}

const Output = ({
  list,
  loading,
  currentPage,
  perPage,
  maxPage
}: OutputProps) => {
  if ((list.data ?? []).length) {
    return (
      <>
        {(list.data ?? []).map((item, index) => (
          <DraggableListItem
            item={item}
            index={index}
            key={item.id}
            currentPage={currentPage}
            maxPage={maxPage}
          />
        ))}
      </>
    );
  }

  if (loading) {
    return (
      <>
        {Array.from({ length: perPage }).map((item, index) => (
          <DraggableListItem
            item={{
              id: `index-${index}`
            }}
            index={index}
            // eslint-disable-next-line react/no-array-index-key
            key={`index-${index}`}
            currentPage={currentPage}
            maxPage={maxPage}
          />
        ))}
      </>
    );
  }

  return (
    <Typography>
      Список пуст. Нажмите на кнопку &quot;Добавить&quot;, чтобы создать новый
      элемент
    </Typography>
  );
};

const DraggableList: FC<DraggableListProps> = ({
  onDragEnd,
  currentPage,
  maxPage
}) => {
  const { list, listLoading, perPage } = mainStore;

  return (
    <Box
      sx={{
        position: 'relative',
        height: 'calc(100dvh - 210px)',
        overflow: 'scroll'
      }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-list">
          {(provided) => (
            <List
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{ width: '100%' }}
            >
              <Output
                list={list}
                loading={listLoading}
                currentPage={currentPage}
                perPage={perPage}
                maxPage={maxPage}
              />
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default observer(DraggableList);
