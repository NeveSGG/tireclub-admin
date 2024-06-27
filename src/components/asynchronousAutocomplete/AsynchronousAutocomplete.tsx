import React, {
  FC,
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  SyntheticEvent
} from 'react';
import {
  TextField,
  Autocomplete,
  CircularProgress,
  Checkbox,
  Chip,
  Typography,
  Box,
  IconButton,
  Stack,
  Tooltip
} from '@mui/material';
import IosShareIcon from '@mui/icons-material/IosShare';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import _, { debounce } from 'lodash';

import introspectionStore from 'store/IntrospectionStore';
import mainStore from 'store/MainStore';
import notificationStore from 'store/NotificationStore';

import { IIntrospectedRoute, IPaginate } from 'types/types';
import { makeClassificationLabel } from 'helpers/functions';
import environment from 'config/environments/environment';

interface IProps {
  id?: string;
  multiple?: true;
  model: string | undefined;
  label?: string;
  error?: boolean;
  helperText?: string;
  required: boolean;
  value: any;
  setValue: (newValue: any) => void;
}

const AsynchronousAutocomplete: FC<IProps> = ({
  id,
  multiple,
  model,
  label,
  required,
  error,
  helperText,
  value,
  setValue
}) => {
  const initialInputValue = useMemo(() => {
    if (!Array.isArray(value) && value) {
      return value.name || value.title || value.id || '';
    }

    return '';
  }, [value]);

  const { introspectionRoutes, introspection } = introspectionStore;
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(initialInputValue);
  const [foundRoute, setFoundRoute] = useState<IIntrospectedRoute | undefined>(
    undefined
  );
  const [pagination, setPagination] = useState<IPaginate>({
    paginate: true,
    page: 1,
    lastpage: 1,
    perpage: 30
  });
  const [lastScrollTop, setLastScrollTop] = useState<number>(0);
  const [listElement, setListElement] = useState<HTMLUListElement | null>(null);

  const searchByField: string = useMemo(() => {
    if (
      foundRoute &&
      foundRoute.url &&
      introspection &&
      introspection[foundRoute.url.slice(1)]
    ) {
      const fieldset = introspection[foundRoute.url.slice(1)].fields;
      const fields = [
        'name',
        'title',
        'value',
        'subtitle',
        'city',
        'description'
      ];

      const foundField = fields.find((field) => fieldset[field]);

      return foundField || 'id';
    }
    return '';
  }, [foundRoute, introspection]);

  const handleScroll = useCallback(
    debounce((event: any) => {
      const { scrollTop, scrollHeight, clientHeight } = event.target;
      if (scrollTop && scrollHeight - scrollTop === clientHeight) {
        setListElement(event.target);
        setLastScrollTop(scrollTop);
        setPagination((oldPagination) => ({
          ...oldPagination,
          page: (oldPagination.page ?? 0) + 1
        }));
      }
    }, 300),
    []
  );

  const onAutocompleteOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const onAutocompleteClose = useCallback(() => {
    setOpen(false);
  }, []);

  const onAutocompleteChange = (event: SyntheticEvent, newValue: any) => {
    if (multiple) {
      const newVallueUpdated = [...newValue];

      const newRes = newVallueUpdated.map((obj) => {
        const newObj = { ...obj };
        delete newObj.metadata;
        return newObj;
      });

      setValue(newRes);
      // clutch
      // const backupValue = inputValue;
      // requestAnimationFrame(() => {
      //   setInputValue(backupValue);
      // });
      // end clutch

      event.preventDefault();
      event.stopPropagation();
    } else {
      const newVallueUpdated = { ...newValue };
      delete newVallueUpdated.metadata;

      setValue({ ...newVallueUpdated });
    }
  };

  const autocompleteIsOptionEqualToValue = useCallback(
    (option: any, val: any) => option.id === val.id,
    []
  );

  const autocompleteGetOptionLabel = useCallback(
    (option: any) => option.name || option.id || '',
    []
  );

  const addMoreItems = useCallback(
    debounce(
      (
        propsFoundRoute: IIntrospectedRoute,
        propsPagination: IPaginate,
        propsInputValue: string,
        propsLastScrollTop: number
      ) => {
        setLoading(true);

        mainStore
          .getList(
            propsFoundRoute.url.slice(1),
            propsPagination,
            propsInputValue,
            searchByField
          )
          .then((response) => {
            if (response.isOk) {
              setPagination((oldPagination) => ({
                ...oldPagination,
                lastpage: response.data.last_page
              }));
              setOptions((oldOptions) => {
                return _.uniqBy(
                  [...oldOptions, ...(response.data.data ?? [])],
                  (val) => val.id
                );
              });
              setTimeout(() => {
                if (listElement) {
                  listElement.scrollTop = propsLastScrollTop;
                }
              }, 1);
            } else {
              notificationStore.error(response.msg);
            }
            setLoading(false);
          })
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });
      },
      300
    ),
    [listElement, searchByField]
  );

  useEffect(() => {
    if (open && options.length === 0) {
      if (model) {
        setLoading(true);
        const newFoundRoute = introspectionRoutes.find(
          (route) => route.model_name === model
        );

        if (newFoundRoute) {
          setFoundRoute(newFoundRoute);
        }
      }
    }
  }, [introspectionRoutes, model, open]);

  useEffect(() => {
    setOptions([]);
    setPagination((oldPag) => ({ ...oldPag, page: 1 }));
  }, [inputValue]);

  useEffect(() => {
    if (!open) return;

    if (!model) return;

    if (!foundRoute) return;

    if (options.length === 0) {
      addMoreItems(foundRoute, pagination, inputValue, lastScrollTop);
      return;
    }

    if (
      !pagination.page ||
      !pagination.lastpage ||
      pagination.page > pagination.lastpage
    ) {
      return;
    }

    addMoreItems(foundRoute, pagination, inputValue, lastScrollTop);
  }, [open, model, foundRoute, inputValue, pagination.page]);

  useEffect(() => {
    return () => mainStore.cleanList();
  }, []);

  return (
    <Autocomplete
      id={id || 'asynchronous-demo'}
      multiple={multiple}
      disableCloseOnSelect={multiple}
      fullWidth
      openOnFocus
      size="small"
      open={open}
      onOpen={onAutocompleteOpen}
      onClose={onAutocompleteClose}
      value={value}
      onChange={onAutocompleteChange}
      inputValue={inputValue}
      onInputChange={(e, v) => {
        if (e.type === 'change') {
          setInputValue(v);
        }
      }}
      isOptionEqualToValue={autocompleteIsOptionEqualToValue}
      getOptionLabel={autocompleteGetOptionLabel}
      clearOnBlur={false}
      options={options}
      loading={loading}
      ListboxProps={{
        onScroll: handleScroll
      }}
      renderOption={(props, option, { selected }) => (
        <li {...props} key={option.id}>
          {multiple && (
            <Checkbox
              size="small"
              style={{ marginRight: 8 }}
              checked={selected}
            />
          )}
          <Stack
            width="100%"
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography>
              {option.name ||
                option.value ||
                option.title ||
                option.subtitle ||
                option.city ||
                option.id}
            </Typography>
            <Stack
              display="flex"
              flexDirection="row"
              alignItems="center"
              gap="8px"
            >
              {option.metadata?.classification?.instance && (
                <Typography color="GrayText" textAlign="end">
                  {makeClassificationLabel(
                    option.metadata.classification.instance
                  )}
                </Typography>
              )}
              <Tooltip title="Открыть в новой вкладке" placement="left">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    if (foundRoute) {
                      window.open(
                        `${environment.panelBasePath}${foundRoute.url}/${option.id}`,
                        '_blank'
                      );
                    }
                  }}
                >
                  <IosShareIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </li>
      )}
      renderTags={(val, getTagProps, ownerState) => {
        const limitTags = ownerState.focused ? 20 : 2;
        const tags = val.slice(0, limitTags);

        const remainingTagsCount = val.length - limitTags;
        let remainingTagsText = '';

        if (remainingTagsCount > 0) {
          remainingTagsText = `+${remainingTagsCount}`;
        }

        return tags
          .map((tag, index) => (
            <Chip
              label={tag.name || tag.title || tag.value || tag.id}
              {...getTagProps({ index })}
              onClick={() => {
                if (foundRoute) {
                  window.open(
                    `${environment.panelBasePath}${foundRoute.url}/${tag.id}`,
                    '_blank'
                  );
                }
              }}
              size="small"
            />
          ))
          .concat(
            <Typography key="remaining-tags" sx={{ display: 'inline' }}>
              {remainingTagsText}
            </Typography>
          );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          error={error}
          helperText={helperText}
          label={`${label}${required ? '*' : ''}`}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <Box>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
                <Tooltip title="Добавить новый элемент" placement="top">
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (foundRoute) {
                        window.open(
                          `${environment.panelBasePath}${foundRoute.url}`,
                          '_blank'
                        );
                      }
                    }}
                  >
                    <AddCircleIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )
          }}
        />
      )}
      filterOptions={(x) => x}
      loadingText="Загрузка..."
      noOptionsText="Пусто"
      openText="Открыть"
      clearText="Очистить"
      closeText="Закрыть"
      sx={{
        backgroundColor: '#fff'
      }}
    />
  );
};

export default memo(AsynchronousAutocomplete);
