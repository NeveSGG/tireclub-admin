import React, { FC, useEffect, useState, useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Stack,
  TextField,
  Skeleton,
  Checkbox,
  Button,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Autocomplete
} from '@mui/material';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from 'react-beautiful-dnd';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import introspectionStore from 'store/IntrospectionStore';
import globalStore from 'store/GlobalStore';

import Editor from 'components/editor';

import { observer } from 'mobx-react-lite';
import { useFormik } from 'formik';
import { Formik, Schema, IIntrospectFields } from 'types/types';
import { createValidationSchema, isObject } from 'helpers/functions';
import MicroresImage from 'components/microresImage';
import MicroresMedia from 'components/microresMedia';
import { defaultSchema } from 'helpers/microres';

interface InputProps {
  value: string;
  field: string;
  fields: IIntrospectFields;
  error: boolean | undefined;
  helperText: string | false | undefined;
  form: Formik;
}

interface IProps {
  fieldName: string;
  schemaType?: string | null;
  arr: string;
  setFormValues(newVal: any): void;
  formValues: any;
}

const closedAddingWindowStyles = {
  transition: 'all .3s ease-in-out',
  width: '49px',
  height: '49px',
  padding: '3px',
  border: '1px solid #B9C6DF',
  display: 'flex',
  alignItems: 'start',
  justifyContent: 'start',
  backgroundColor: 'white'
};

const openedAddingWindowStyles = {
  transition: 'all .3s ease-in-out',
  width: '100%',
  height: 'min-content',
  padding: '8.5px 14px',
  border: '1px solid #B9C6DF',
  backgroundColor: 'white'
};

const Input: FC<InputProps> = ({
  value,
  field,
  fields,
  error,
  helperText,
  form
}) => {
  if (value === undefined) {
    return (
      <Skeleton
        animation="wave"
        variant="rounded"
        sx={{ height: '40px', width: '100%' }}
      />
    );
  }

  if (fields[field]?.type === 'boolean') {
    return (
      <Checkbox
        id={field}
        name={field}
        checked={Boolean(value)}
        onChange={(e, newVal) => {
          form.setValues({ ...form.values, [field]: newVal ? 1 : 0 });
        }}
      />
    );
  }

  if (field.includes('text_content')) {
    return (
      <Editor
        value={value === null ? '' : value}
        onEditorChange={form.handleChange}
        id={field}
        width="100%"
        formikValues={form?.values}
        formikHandleChange={form.setValues}
      />
    );
  }

  if (field.includes('image_url')) {
    return (
      <MicroresImage
        imageUrl={value}
        formikValues={form?.values}
        formikHandleChange={form.setValues}
        fieldName={field}
      />
    );
  }

  if (field.includes('media_url')) {
    return (
      <MicroresMedia
        fileUrl={value}
        formikValues={form?.values}
        formikHandleChange={form.setValues}
        fieldName={field}
      />
    );
  }

  if (fields[field]?.type === 'text') {
    return (
      <TextField
        multiline
        lang="ru"
        fullWidth
        id={field}
        name={field}
        error={error}
        helperText={helperText}
        size="small"
        inputProps={{
          style: {
            minHeight: '100px'
          }
        }}
        disabled={
          field.includes('_at') || field.includes('_id') || field === 'id'
        }
        value={value === null ? '' : value}
        onChange={form.handleChange}
      />
    );
  }

  if (field.includes('_at') || field === 'date') {
    return (
      <DatePicker
        label={fields[field]?.label ? fields[field]?.label : field}
        value={dayjs(value)}
        onChange={(newVal: any) => {
          form.setValues({
            ...form.values,
            [field]: newVal ? newVal.format('YYYY-MM-DD') : null
          });
        }}
        format="DD MMMM YYYY"
        readOnly={field.includes('_at')}
        slotProps={{
          field: { clearable: true, readOnly: true },
          textField: {
            id: field,
            name: field,
            error,
            helperText,
            size: 'small',
            fullWidth: true,
            FormHelperTextProps: {
              style: {
                backgroundColor: '#eff2f9',
                margin: 0,
                padding: '4px 14px 0 14px'
              }
            }
          }
        }}
      />
    );
  }

  if (field.includes('_enum')) {
    const schema = fields[field]?.schema || '[]';
    let autocompleteValue = value;

    if (!isObject(value)) {
      const objVal = JSON.parse(schema).find((el: any) => el.value === value);

      autocompleteValue = objVal ?? value;
    }

    return (
      <Autocomplete
        id={field}
        multiple={false}
        fullWidth
        openOnFocus
        size="small"
        value={autocompleteValue}
        onChange={(_e, option) => {
          form.setValues({
            ...form.values,
            [field]: option
          });
        }}
        options={JSON.parse(schema)}
        getOptionLabel={(option: any) => option.label || ''}
        isOptionEqualToValue={(option: any, v: any) =>
          option?.value === v?.value
        }
        renderInput={(params) => (
          <TextField
            {...params}
            error={error}
            helperText={helperText}
            label={fields[field]?.label ? fields[field]?.label : field}
            InputProps={{
              ...params.InputProps,
              endAdornment: params.InputProps.endAdornment
            }}
          />
        )}
        noOptionsText="Пусто"
        openText="Открыть"
        clearText="Очистить"
        closeText="Закрыть"
      />
    );
  }

  return (
    <TextField
      fullWidth
      lang="ru"
      id={field}
      name={field}
      error={error}
      helperText={helperText}
      size="small"
      disabled={
        field.includes('_at') || field.includes('_id') || field === 'id'
      }
      value={value === null ? '' : value}
      onChange={form.handleChange}
    />
  );
};

const MicroresField: FC<IProps> = ({
  fieldName,
  schemaType = null,
  arr,
  setFormValues,
  formValues
}) => {
  const [editItemInd, setEditItemInd] = useState<number>(-1);
  const [addItemOpen, setAddItemOpen] = useState<boolean>(false);
  const [schema, setSchema] = useState<any>(null);
  const [validationSchema, setValidationSchema] = useState<null | Schema>(null);

  const parsedArr: Readonly<Array<any>> = JSON.parse(arr === null ? '[]' : arr);

  const { introspection } = introspectionStore;
  const { path } = globalStore;

  useEffect(() => {
    const introspectedShema = JSON.parse(
      (((introspection[path.slice(1)] || {}).fields || {})[fieldName] || {})
        .schema || '{}'
    );

    let newSchema = {};

    if (Array.isArray(introspectedShema)) {
      newSchema =
        introspectedShema.find((el) => el.type === schemaType)?.schema ??
        defaultSchema;
    } else if (
      introspectedShema !== null &&
      typeof introspectedShema === 'object'
    ) {
      newSchema = introspectedShema;
    }

    console.log(introspectedShema, schemaType);

    setSchema(newSchema);
  }, [introspection, fieldName, schemaType]);

  const formik: Formik = useFormik({
    initialValues: {},
    validationSchema,
    onSubmit: async (values: any) => {
      if (addItemOpen) {
        setFormValues({
          ...formValues,
          [fieldName]: JSON.stringify([
            ...parsedArr,
            {
              ...values
            }
          ])
        });
        setAddItemOpen(false);
      } else {
        const newArr = [...parsedArr];
        newArr[editItemInd] = structuredClone(values);
        setFormValues({
          ...formValues,
          [fieldName]: JSON.stringify(newArr)
        });
        setEditItemInd(-1);
      }
    }
  });

  useEffect(() => {
    if (schema) {
      setValidationSchema(createValidationSchema(schema));

      formik.setValues({
        ...Object.keys(schema).reduce((acc, key) => {
          acc[key] = '';
          return acc;
        }, {} as any)
      });
    }
  }, [schema]);

  useEffect(() => {
    if (editItemInd !== -1) {
      formik.setValues(parsedArr[editItemInd]);
    } else if (schema) {
      formik.setValues({
        ...Object.keys(schema).reduce((acc, key) => {
          acc[key] = '';
          return acc;
        }, {} as any)
      });
    }
  }, [editItemInd]);

  useEffect(() => {
    if (addItemOpen) {
      formik.setValues({
        ...Object.keys(schema).reduce((acc, key) => {
          acc[key] = '';
          return acc;
        }, {} as any)
      });
    }
  }, [addItemOpen]);

  const onDrop = useCallback(
    ({ destination, source }: DropResult) => {
      if (destination && destination.index !== source.index) {
        const sortedArr = [...parsedArr];
        const [removed] = sortedArr.splice(source.index, 1);
        sortedArr.splice(destination.index, 0, removed);

        setFormValues({
          ...formValues,
          [fieldName]: JSON.stringify(sortedArr)
        });
      }
    },
    [parsedArr, setFormValues, formValues]
  );

  const onDelete = useCallback(
    (ind: number) => {
      const newArr = [...parsedArr];
      newArr.splice(ind, 1);

      setFormValues({
        ...formValues,
        [fieldName]: JSON.stringify(newArr)
      });
    },
    [parsedArr, setFormValues, formValues]
  );

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '4px',
        width: '100%',
        height: '386px',
        padding: '8.5px 14px',
        border: '1px solid rgba(0, 0, 0, 0.25)',
        overflow: 'auto'
      }}
    >
      <DragDropContext
        onDragEnd={onDrop}
        onDragStart={() => {
          setEditItemInd(-1);
          setAddItemOpen(false);
        }}
      >
        <Droppable droppableId="droppable-list">
          {(provided) => (
            <List
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                p: 0,
                width: '100%',
                height: 'content',
                maxHeight: '318px',
                overflow: 'scroll'
              }}
            >
              {parsedArr.map((item: any, index: number) => (
                <Draggable
                  draggableId={`${item[Object.keys(item)[0]]}${index}`}
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${item[Object.keys(item)[0]]}${index}`}
                  index={index}
                >
                  {(providedProps, snapshot) => (
                    <>
                      <ListItem
                        ref={providedProps.innerRef}
                        {...providedProps.draggableProps}
                        {...providedProps.dragHandleProps}
                        sx={{
                          backgroundColor: snapshot.isDragging
                            ? 'background.paper'
                            : 'background.default',
                          border: '1px solid #ffffff',
                          borderColor: 'divider',
                          transition: 'color .2s linear',
                          '&:hover': {
                            color: '#EF353D'
                          }
                        }}
                        dense
                        secondaryAction={
                          <Stack display="flex" flexDirection="row">
                            {index === editItemInd ? (
                              <IconButton
                                onClick={() => {
                                  setAddItemOpen(false);
                                  setEditItemInd(-1);
                                }}
                              >
                                <ExpandLess color="info" />
                              </IconButton>
                            ) : (
                              <IconButton
                                onClick={() => {
                                  setAddItemOpen(false);
                                  setEditItemInd(index);
                                }}
                              >
                                <ExpandMore color="info" />
                              </IconButton>
                            )}
                            <IconButton
                              onClick={() => {
                                onDelete(index);
                                setEditItemInd(-1);
                              }}
                            >
                              <DeleteOutlineIcon color="error" />
                            </IconButton>
                          </Stack>
                        }
                      >
                        <ListItemText
                          primary={item[Object.keys(item)[0]]}
                          secondary={
                            Object.keys(item)[1]
                              ? item[Object.keys(item)[1]]
                              : undefined
                          }
                          sx={{
                            '&:hover': {
                              cursor: 'pointer'
                            }
                          }}
                          onClick={() => {
                            if (index === editItemInd) {
                              setAddItemOpen(false);
                              setEditItemInd(-1);
                            } else {
                              setAddItemOpen(false);
                              setEditItemInd(index);
                            }
                          }}
                        />
                      </ListItem>
                      <Collapse
                        in={index === editItemInd}
                        timeout="auto"
                        unmountOnExit
                      >
                        <List component="div" disablePadding>
                          {path &&
                            schema &&
                            Object.keys(schema).map((field) => {
                              return (
                                <ListItem
                                  sx={{ pl: 3 }}
                                  key={`${field}_${schema[field].label}`}
                                >
                                  <Stack
                                    key={field}
                                    sx={{
                                      display: 'flex',
                                      flexDirection: 'row',
                                      alignItems: 'flex-start',
                                      width: '100%',
                                      pb: 1
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        width: '15%',
                                        maxWidth: '300px',
                                        textAlign: 'right',
                                        display: 'block'
                                      }}
                                      paddingTop="7px"
                                      key={field}
                                    >
                                      {schema[field].label}
                                    </Typography>
                                    <Box
                                      sx={{
                                        width: '85%',
                                        minHeight: '64px',
                                        display: 'block',
                                        height: 'fit-content',
                                        pl: 3
                                      }}
                                    >
                                      <Input
                                        field={field}
                                        fields={
                                          introspection[path.slice(1)].fields
                                        }
                                        value={formik.values[field]}
                                        form={formik}
                                        error={
                                          formik.touched[field] &&
                                          Boolean(formik.errors[field])
                                        }
                                        helperText={
                                          formik.touched[field] &&
                                          formik.errors[field]?.toString()
                                        }
                                      />
                                    </Box>
                                  </Stack>
                                </ListItem>
                              );
                            })}
                          <Button onClick={formik.submitForm}>Применить</Button>
                        </List>
                      </Collapse>
                    </>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      <Box
        sx={addItemOpen ? openedAddingWindowStyles : closedAddingWindowStyles}
      >
        <IconButton
          onClick={() => {
            setAddItemOpen((oldState) => !oldState);
            setEditItemInd(-1);
          }}
          color="primary"
        >
          {addItemOpen ? <RemoveIcon /> : <AddIcon />}
        </IconButton>
        {addItemOpen && (
          <>
            {path &&
              schema &&
              Object.keys(schema).map((field) => {
                return (
                  <Stack
                    key={field}
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      width: '100%',
                      pb: 1
                    }}
                  >
                    <Typography
                      sx={{
                        width: '15%',
                        maxWidth: '300px',
                        textAlign: 'right',
                        display: 'block'
                      }}
                      paddingTop="7px"
                      key={field}
                    >
                      {schema[field].label}
                    </Typography>
                    <Box
                      sx={{
                        width: '85%',
                        minHeight: '64px',
                        display: 'block',
                        height: 'fit-content',
                        pl: 3
                      }}
                    >
                      <Input
                        field={field}
                        fields={introspection[path.slice(1)].fields}
                        value={formik.values[field]}
                        form={formik}
                        error={
                          formik.touched[field] && Boolean(formik.errors[field])
                        }
                        helperText={
                          formik.touched[field] &&
                          formik.errors[field]?.toString()
                        }
                      />
                    </Box>
                  </Stack>
                );
              })}
            <Button
              disabled={!formik.isValid || formik.isValidating}
              onClick={formik.submitForm}
            >
              Добавить
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default observer(MicroresField);
