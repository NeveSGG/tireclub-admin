import React, { FC, useState, useEffect, useCallback } from 'react';
import {
  Checkbox,
  LinearProgress,
  Stack,
  TextField,
  IconButton,
  Autocomplete
} from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useFormik } from 'formik';
import { v4 as uuidv4 } from 'uuid';
import { IIntrospectData, IPaginate, Schema } from 'types/types';
import globalStore from 'store/GlobalStore';
import { createValidationSchema } from 'helpers/functions';
import mainStore from 'store/MainStore';
import notificationStore from 'store/NotificationStore';
import AsynchronousAutocomplete from 'components/asynchronousAutocomplete';
import { observer } from 'mobx-react-lite';
import MicroresField from 'components/microresField';
import introspectionStore from 'store/IntrospectionStore';

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '700px',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  border: '1px solid #B9C6DF',
  borderRadius: '5px',
  overflow: 'scroll',
  boxShadow: 24,
  p: '10px 24px 0 24px'
};

interface IProps {
  pagination: IPaginate;
  customPath?: string;
}

const FormModal: FC<IProps> = ({ pagination, customPath }) => {
  const path = customPath ?? globalStore.path;
  const { introspection } = introspectionStore;
  const [fields, setFields] = useState<IIntrospectData>(
    JSON.parse(localStorage.getItem(path.slice(1)) || '{"fields":{},"rels":{}}')
  );
  const [open, setOpen] = useState<boolean>(false);
  const [validationSchema, setValidationSchema] = useState<null | Schema>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: Object.keys(fields.fields).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {} as any),
    validationSchema,
    onSubmit: async (values) => {
      const resultData = Object.keys(values).reduce((acc, key) => {
        if (key.includes('_enum')) {
          acc[key] = values[key].value;
          return acc;
        }

        if (typeof values[key] === 'object') {
          acc[key] = values[key].id;
          return acc;
        }

        if (key.includes('microres_')) {
          acc[key] = values[key] ?? '[]';
          return acc;
        }

        acc[key] = values[key];
        return acc;
      }, {} as any);
      const sendResult = await mainStore.createItem(
        path.slice(1),
        { ...resultData, id: uuidv4() },
        pagination
      );
      if (sendResult.isOk) {
        formik.resetForm();
        notificationStore.success('Элемент успешно создан');
      } else {
        notificationStore.success(sendResult.msg);
      }
      setOpen(false);
    },
    onReset: () => {
      formik.setValues({});
      formik.setErrors({});
    }
  });

  useEffect(() => {
    if (!path) return;

    if (introspection[path]) {
      setFields(introspection[path]);
      setValidationSchema(createValidationSchema(introspection[path].fields));
    } else {
      const item = localStorage.getItem(path.slice(1));
      if (item) {
        const parsed = JSON.parse(item);
        setFields(parsed);
        setValidationSchema(createValidationSchema(parsed.fields));

        formik.initialValues = Object.keys(parsed.fields).reduce((acc, key) => {
          if (parsed.fields[key].type === 'boolean') {
            acc[key] = true;
          } else {
            acc[key] = '';
          }
          return acc;
        }, {} as any);
      } else {
        const introspected = introspectionStore.introspect(path.slice(1));

        introspected.then((val) => {
          setFields(val.data);
          setValidationSchema(createValidationSchema(val.data.fields));
        });
      }
    }
  }, [path]);

  const helperText = (el: string) => {
    if (formik.touched[el]) {
      return formik.errors[el]?.toString() ?? undefined;
    }
    return undefined;
  };

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => {
    setOpen(false);
    formik.resetForm();
  }, []);

  return (
    <>
      <Button onClick={handleOpen} variant="contained">
        Добавить
      </Button>
      <Modal
        aria-labelledby="transition-modal-title"
        // aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        sx={{ overflow: 'scroll', pb: 0, mb: 0 }}
      >
        <Fade in={open} style={{ backgroundColor: '#eff2f9' }}>
          <Box sx={style}>
            <Typography id="transition-modal-title" variant="h6" component="h2">
              Добавление элемента
            </Typography>
            <form style={{ paddingTop: 14, paddingBottom: 0, marginBottom: 0 }}>
              {Object.keys(fields.fields).map((el) => {
                const { required, label, type, show, schema } =
                  fields.fields[el];
                if (!required) return null;
                let returnNode = null;

                if (show) {
                  returnNode = (
                    <TextField
                      fullWidth
                      id={el}
                      size="small"
                      name={el}
                      required={required}
                      label={label}
                      value={formik.values[el]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched[el] && Boolean(formik.errors[el])}
                      helperText={helperText(el)}
                      color="info"
                      FormHelperTextProps={{
                        style: {
                          backgroundColor: '#eff2f9',
                          margin: 0,
                          padding: '4px 14px 0 14px'
                        }
                      }}
                      sx={{
                        backgroundColor: '#fff'
                      }}
                    />
                  );

                  if (type === 'boolean') {
                    returnNode = (
                      <Stack
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 1,
                          mt: 1
                        }}
                      >
                        <Checkbox
                          id={el}
                          name={el}
                          value={formik.values[el] ? 1 : 0}
                          checked={Boolean(formik.values[el])}
                          onChange={(e, newVal) => {
                            formik.setValues({
                              ...formik.values,
                              [el]: newVal ? 1 : 0
                            });
                          }}
                          onBlur={formik.handleBlur}
                          color="info"
                          size="small"
                        />
                        <Typography paragraph sx={{ m: 0, p: 0 }}>
                          {label}
                        </Typography>
                      </Stack>
                    );
                  }

                  if (el.includes('_id')) {
                    const foundRel = Object.keys(fields.rels).find(
                      (rel) => fields.rels[rel][2] === el
                    );
                    returnNode = (
                      <AsynchronousAutocomplete
                        label={label}
                        value={formik.values[el] || null}
                        error={formik.touched[el] && Boolean(formik.errors[el])}
                        helperText={helperText(el)}
                        setValue={(newAutocompleteValue) => {
                          formik.setValues(
                            { ...formik.values, [el]: newAutocompleteValue },
                            true
                          );
                        }}
                        model={foundRel ? fields.rels[foundRel][1] : foundRel}
                        required={required}
                      />
                    );
                  }

                  if (el.includes('microres_')) {
                    returnNode = (
                      <MicroresField
                        fieldName={el}
                        arr={formik.values[el] || '[]'}
                        setFormValues={formik.setValues}
                        formValues={formik.values}
                      />
                    );
                  }

                  if (el.includes('_enum')) {
                    returnNode = (
                      <Autocomplete
                        id={el}
                        multiple={false}
                        fullWidth
                        openOnFocus
                        size="small"
                        value={
                          formik.values[el] || { label: null, value: null }
                        }
                        onChange={(_e, option) => {
                          formik.setValues({
                            ...formik.values,
                            [el]: option
                          });
                        }}
                        options={JSON.parse(schema || '[]')}
                        getOptionLabel={(option) => option.label || ''}
                        isOptionEqualToValue={(option: any, v: any) =>
                          option?.value === v?.value
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            error={
                              formik.touched[el] && Boolean(formik.errors[el])
                            }
                            helperText={helperText(el)}
                            label={`${label}${required ? '*' : ''}`}
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
                        sx={{
                          backgroundColor: '#fff'
                        }}
                      />
                    );
                  }

                  if (el.includes('_at') || el.includes('date')) {
                    returnNode = (
                      <DatePicker
                        label={label}
                        value={formik.values[el]}
                        onChange={(newVal) => {
                          formik.setValues({
                            ...formik.values,
                            [el]: newVal ? newVal.format('YYYY-MM-DD') : null
                          });
                        }}
                        format="DD MMMM YYYY"
                        slotProps={{
                          field: { clearable: true, readOnly: true },
                          textField: {
                            id: el,
                            size: 'small',
                            fullWidth: true,
                            error:
                              formik.touched[el] && Boolean(formik.errors[el]),
                            required,
                            helperText: helperText(el),
                            color: 'info',
                            FormHelperTextProps: {
                              style: {
                                backgroundColor: '#eff2f9',
                                margin: 0,
                                padding: '4px 14px 0 14px'
                              }
                            }
                          }
                        }}
                        sx={{
                          backgroundColor: '#fff'
                        }}
                      />
                    );
                  }
                }

                return (
                  <Box
                    key={el}
                    sx={{
                      mt: 1,
                      p: 0,
                      width: '100%',
                      minHeight: 64,
                      display: returnNode ? 'block' : 'none'
                    }}
                  >
                    {returnNode}
                  </Box>
                );
              })}
              <Button
                type="submit"
                disabled={!formik.isValid || formik.isValidating}
                onClick={(e) => {
                  e.preventDefault();
                  formik.submitForm();
                }}
                sx={{ mt: 2, mb: 2 }}
                variant="contained"
                color="primary"
              >
                Добавить
              </Button>
            </form>
            <LinearProgress
              sx={{ display: formik.isSubmitting ? 'block' : 'none' }}
            />
            <IconButton
              sx={{
                position: 'absolute',
                top: 6,
                right: 0,
                borderRadius: '8px'
              }}
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default observer(FormModal);
