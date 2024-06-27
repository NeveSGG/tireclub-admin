import React, { FC, useState, useEffect } from 'react';
import {
  Pagination,
  Box,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { DropResult } from 'react-beautiful-dnd';
import DraggableList from 'components/draggableList';
import { observer } from 'mobx-react-lite';
import mainStore, { PageVariant } from 'store/MainStore';
import globalStore from 'store/GlobalStore';
import notificationStore from 'store/NotificationStore';
import { IPaginate } from 'types/types';
import FormModal from 'components/formModal';

interface IProps {
  route: string;
  name: string;
}

const makeListRequest = (
  route: string,
  pagination: IPaginate,
  search?: string
) => {
  const request = mainStore.getList(route.slice(1), pagination, search);

  request.then((reqval) => {
    if (!reqval.isOk) {
      notificationStore.error(reqval.msg);
    }
  });
};

const Listing: FC<IProps> = ({ route, name }) => {
  const { list, perPage, searchString } = mainStore;
  const [pagination, setPagination] = useState<IPaginate>({
    page: 1,
    paginate: true,
    perpage: perPage,
    lastpage: 1
  });

  useEffect(() => {
    makeListRequest(route, pagination, searchString);
  }, [pagination, searchString]);

  useEffect(() => {
    globalStore.changeName(name);
  }, [name]);

  useEffect(() => {
    globalStore.changePath(route);
    setPagination({
      page: 1,
      paginate: true,
      perpage: perPage,
      lastpage: 1
    });
  }, [route, perPage]);

  // dont`t delete pls (for updating state)
  useEffect(() => {}, [list.data]);

  const onDrop = ({ destination, source }: DropResult) => {
    if (list && list.data && destination) {
      const direction = Math.sign(destination.index - source.index);

      if (destination.index === source.index) {
        // nothing to do
      } else if (destination.index === list.data.length - 1) {
        if (pagination.page === list.last_page) {
          mainStore.sortItem(
            route.slice(1),
            list.data[source.index].id,
            {
              ...list.data[source.index],
              sort: list.data[destination.index].sort + 100
            },
            PageVariant.currentPage,
            pagination,
            source.index
          );
        } else {
          mainStore.sortItem(
            route.slice(1),
            list.data[source.index].id,
            {
              ...list.data[source.index]
            },
            PageVariant.nextPage,
            pagination,
            source.index
          );
        }
      } else if (destination.index === 0) {
        if (pagination.page === 1) {
          mainStore.sortItem(
            route.slice(1),
            list.data[source.index].id,
            {
              ...list.data[source.index],
              sort: list.data[destination.index].sort - 100
            },
            PageVariant.currentPage,
            pagination,
            source.index
          );
        } else {
          mainStore.sortItem(
            route.slice(1),
            list.data[source.index].id,
            {
              ...list.data[source.index]
            },
            PageVariant.prevPage,
            pagination,
            source.index
          );
        }
      } else {
        mainStore.sortItem(
          route.slice(1),
          list.data[source.index].id,
          {
            ...list.data[source.index],
            sort: Math.floor(
              (list.data[destination.index + direction * 1].sort +
                list.data[destination.index].sort) /
                2
            )
          },
          PageVariant.currentPage,
          pagination,
          source.index
        );
      }
    }
  };

  return (
    <Box>
      <FormModal pagination={pagination} />
      <DraggableList
        onDragEnd={onDrop}
        currentPage={list.current_page}
        maxPage={list.last_page}
      />
      <Stack
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Pagination
          count={list.last_page}
          page={pagination.page}
          onChange={(_e, val) =>
            setPagination((oldPag) => ({ ...oldPag, page: val }))
          }
          shape="rounded"
        />

        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="select-showable-number-label">Количество</InputLabel>
          <Select
            labelId="select-showable-number-label"
            id="select-showable-number"
            defaultValue={perPage}
            value={perPage}
            onChange={(event) => {
              mainStore.setPerPage(+event.target.value);
            }}
            autoWidth
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={15}>15</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50000}>Все</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Box>
  );
};

export default observer(Listing);
