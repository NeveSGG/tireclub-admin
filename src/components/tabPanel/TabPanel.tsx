import React, { FC, ReactNode } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Skeleton,
  Checkbox,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import Editor from 'components/editor';
import AsynchronousAutocomplete from 'components/asynchronousAutocomplete';

import { Formik, IIntrospectFields } from 'types/types';
import MicroresField from 'components/microresField';
import MicroresImage from 'components/microresImage';
import MicroresMedia from 'components/microresMedia';
import { isObject } from 'helpers/functions';
import globalStore from 'store/GlobalStore';
import { observer } from 'mobx-react';

interface IProps {
  children?: ReactNode;
  index: number;
  value: number;
  formState: Formik;
  fields: IIntrospectFields;
  metadata: any;
}

interface InputProps {
  value: string;
  field: string;
  fields: IIntrospectFields;
  error: boolean | undefined;
  helperText: string | false | undefined;
  form: Formik;
  model: string;
}

const Input: FC<InputProps> = observer(
  ({ value, field, fields, error, helperText, form, model }) => {
    const { path } = globalStore;

    if (value === undefined) {
      return (
        <Skeleton
          animation="wave"
          variant="rounded"
          sx={{ height: '40px', width: '100%' }}
        />
      );
    }

    if (field.includes('microres_')) {
      let schemaType = null;

      if (path === '/microresources') {
        if (form.values.microresource_type_enum) {
          if (typeof form.values.microresource_type_enum === 'string') {
            schemaType = form.values.microresource_type_enum;
          } else if (typeof form.values.microresource_type_enum === 'object') {
            schemaType = form.values.microresource_type_enum.value;
          }
        }
      }

      return (
        <MicroresField
          fieldName={field}
          schemaType={schemaType}
          arr={value}
          setFormValues={form.setValues}
          formValues={form.values}
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

    if (field.includes('image_url')) {
      return (
        <MicroresImage
          imageUrl={value ?? ''}
          formikValues={form?.values || {}}
          formikHandleChange={form.setValues}
          fieldName={field}
        />
      );
    }

    if (field.includes('media_url')) {
      return (
        <MicroresMedia
          fileUrl={value ?? ''}
          formikValues={form?.values || {}}
          formikHandleChange={form.setValues}
          fieldName={field}
        />
      );
    }

    if (fields[field]?.type === 'array' || Array.isArray(value)) {
      const label = fields[field]?.label ? fields[field]?.label : field;

      return (
        <AsynchronousAutocomplete
          multiple
          id={field}
          label={label}
          value={value === null ? '' : value}
          setValue={(newAutocompleteValue) => {
            form.setValues({ ...form.values, [field]: newAutocompleteValue });
          }}
          model={model}
          required={false}
        />
      );
    }

    if (
      fields[field]?.type === 'object' ||
      (fields[field]?.type === undefined && typeof value === 'object')
    ) {
      const label = fields[field]?.label ? fields[field]?.label : field;

      return (
        <AsynchronousAutocomplete
          id={field}
          label={label}
          value={value === null ? '' : value}
          setValue={(newAutocompleteValue) => {
            form.setValues({ ...form.values, [field]: newAutocompleteValue });
          }}
          model={model}
          required={false}
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
  }
);

const TabPanel: FC<IProps> = ({
  children,
  value,
  index,
  formState,
  fields,
  metadata
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && (
        <Box
          sx={{
            mt: 3,
            pt: 2,
            width: '100%',
            height: 'calc(100vh - 140px)',
            overflow: 'auto'
          }}
        >
          {children}
          {Object.keys(fields).map((field) => (
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
                  width: '30%',
                  maxWidth: '300px',
                  textAlign: 'right',
                  display: 'block'
                }}
                paddingTop="7px"
              >
                {fields[field]?.label ? `${fields[field]?.label}:` : field}
                {/* // ) : (
                //   <Skeleton
                //     animation="wave"
                //     variant="text"
                //     sx={{ width: '100%' }}
                //   />
                // )} */}
              </Typography>
              <Box
                sx={{
                  width: '70%',
                  minHeight: '64px',
                  display: 'block',
                  height: 'fit-content',
                  pl: 3
                }}
              >
                <Input
                  field={field}
                  fields={fields}
                  value={formState.values[field]}
                  form={formState}
                  error={
                    formState.touched[field] && Boolean(formState.errors[field])
                  }
                  helperText={
                    formState.touched[field] &&
                    formState.errors[field]?.toString()
                  }
                  model={metadata && metadata[field] ? metadata[field][1] : ''}
                />
              </Box>
            </Stack>
          ))}
        </Box>
      )}
    </div>
  );
};

export default TabPanel;
