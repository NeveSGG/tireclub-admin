import React, {
  FC,
  useCallback,
  useEffect,
  useState,
  SyntheticEvent
} from 'react';
import { Box, Tabs, Tab, Stack, Button, Tooltip, Zoom } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useFormik } from 'formik';

import TabPanel from 'components/tabPanel';

import mainStore from 'store/MainStore';
import introspectionStore from 'store/IntrospectionStore';
import globalStore from 'store/GlobalStore';
import notificationStore from 'store/NotificationStore';

import { createValidationSchema } from 'helpers/functions';

import { Schema } from 'types/types';
import MediaTab from 'components/mediaTab';
import Confirmation from 'components/confirmation';

interface IProps {
  route: string;
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`
  };
}

const Item: FC<IProps> = ({ route }) => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { item } = mainStore;
  const { introspection } = introspectionStore;
  const { path, page } = globalStore;
  const [tabValue, setTabValue] = useState<number>(0);
  const [validationSchema, setValidationSchema] = useState<null | Schema>(null);

  useEffect(() => {
    globalStore.startPageLoading();
    const request = mainStore.getItem(route.slice(1), uuid);

    request.then((reqVal) => {
      if (reqVal.isOk) {
        globalStore.changeName(
          reqVal.data.name ||
            reqVal.data.value ||
            reqVal.data.city ||
            reqVal.data.rating ||
            reqVal.data.id ||
            ''
        );
      } else {
        navigate('/404');
      }
      globalStore.endPageLoading();
    });
  }, [route, uuid]);

  useEffect(() => {
    globalStore.changePath(route);
  }, [route]);

  useEffect(() => {
    return () => {
      mainStore.cleanItem();
    };
  }, []);

  useEffect(() => {
    if (introspection && introspection[route.slice(1)]) {
      setValidationSchema(
        createValidationSchema(
          Object.keys(item).reduce((acc, key) => {
            if (key === 'metadata') return acc;
            if (introspection[route.slice(1)].fields[key]) {
              acc[key] = introspection[route.slice(1)].fields[key];
            } else {
              acc[key] = {
                type: 'array',
                required: false,
                label: `Применимые ${key.replace(/applicable_/g, '')}`,
                show: true
              };
            }
            return acc;
          }, {} as any)
        )
      );
    }
  }, [introspection, item]);

  const formik = useFormik({
    initialValues: {},
    validationSchema,
    onSubmit: async (values: any) => {
      const fieldToDelete: string[] = [];

      const resultData = Object.keys(values).reduce((acc, key) => {
        if (key === 'metadata') {
          return acc;
        }

        if (
          introspection?.[route.slice(1)]?.rels?.[key] &&
          Array.isArray(introspection?.[route.slice(1)]?.rels?.[key])
        ) {
          const foundField = introspection?.[route.slice(1)]?.rels?.[key][2];
          if (foundField) {
            fieldToDelete.push(foundField);
          }
        }

        if (key.includes('_enum')) {
          acc[key] = values[key].value;
          return acc;
        }

        acc[key] = values[key];
        if (key.includes('applicable')) {
          return acc;
        }
        if (key.includes('_id')) {
          acc[key] = values[key]?.id;
          return acc;
        }
        if (key.includes('microres_')) {
          acc[key] = values[key] ?? '[]';
          return acc;
        }
        return acc;
      }, {} as any);

      fieldToDelete.forEach((field) => {
        delete resultData[field];
      });

      Object.entries(resultData).forEach(([key, value]: [string, any]) => {
        if (Array.isArray(value)) {
          resultData[key] = value.map((valueItem) => valueItem.id);
        }
      });

      const sendResult = await mainStore.updateItem(route.slice(1), {
        ...resultData
      });
      if (sendResult.isOk) {
        notificationStore.success('Изменения сохранены');
      } else {
        notificationStore.success(sendResult.msg);
      }
    }
  });

  useEffect(() => {
    formik.setValues({ ...item });
  }, [item]);

  const onTabValueChange = useCallback(
    (event: SyntheticEvent, newValue: number) => {
      setTabValue(newValue);
    },
    []
  );

  return (
    <>
      <Stack
        sx={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            position: 'absolute',
            left: '-24px',
            top: '-26px',
            right: '-24px'
          }}
        >
          <Tabs
            value={tabValue}
            onChange={onTabValueChange}
            aria-label="tabs"
            sx={{ width: '100%' }}
          >
            <Tab value={0} label="Параметры" {...a11yProps(0)} />
            {!Array.isArray(introspection[route.slice(1)].rels) &&
            introspection[route.slice(1)].rels ? (
              <Tab value={1} label="Связи" {...a11yProps(1)} />
            ) : null}
            {introspection?.[route.slice(1)]?.media.length ? (
              <Tab value={2} label="Медиа" {...a11yProps(2)} />
            ) : null}
          </Tabs>
        </Box>
        <Tooltip
          title={`${Object.values(formik.errors).reduce((acc, value) => {
            return `${acc}\n${value}`;
          }, '')}`}
          TransitionComponent={Zoom}
          leaveDelay={300}
          describeChild
          placement="bottom-start"
        >
          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: '20px',
              position: 'absolute',
              right: 0,
              top: '-16px'
            }}
          >
            <Confirmation
              openButtonText="Удалить"
              titleText={`Удалить ${page || ''}?`}
              plainText={`${page || ''} будет удалён навсегда`}
              onAgree={() => {
                const deletingRes = mainStore.deleteItem(
                  route.slice(1),
                  item.id || '',
                  {}
                );

                deletingRes.then((res) => {
                  if (res.isOk) {
                    notificationStore.success(`${page || ''} удалён`);
                    navigate(route);
                  } else {
                    notificationStore.error('Ошибка');
                  }
                });
              }}
              onDisagree={() => {}}
              agreeButtonText="Удалить"
              disagreeButtonText="Отменить"
            />
            <Button
              variant="contained"
              type="button"
              size="small"
              onClick={() => {
                formik.submitForm();
              }}
              disabled={
                !formik.isValid || formik.isValidating || formik.isSubmitting
              }
            >
              Сохранить
            </Button>
          </Stack>
        </Tooltip>
      </Stack>

      <TabPanel
        value={tabValue}
        metadata={item.metadata?.relationships || {}}
        index={0}
        formState={formik}
        fields={Object.keys(item).reduce((acc, field) => {
          if (field === 'metadata') return acc;

          if (route) {
            if (introspection && introspection[route.slice(1)]) {
              if (introspection[route.slice(1)].rels[field]) {
                return acc;
              }
              acc[field] = introspection[route.slice(1)].fields[field];
            } else {
              acc[field] = {
                type: 'string',
                required: false,
                label: `Unknown`,
                show: true
              };
            }
          }

          return acc;
        }, {} as any)}
      />
      {!Array.isArray(introspection[route.slice(1)].rels) &&
      introspection[route.slice(1)].rels ? (
        <TabPanel
          value={tabValue}
          metadata={item.metadata?.relationships || {}}
          index={1}
          formState={formik}
          fields={Object.keys(item).reduce((acc, field) => {
            if (field === 'metadata') return acc;

            if (route) {
              if (introspection && introspection[route.slice(1)]) {
                if (
                  !Array.isArray(introspection[route.slice(1)].rels) &&
                  introspection[route.slice(1)].rels[field]
                ) {
                  acc[field] = {
                    type: introspection[route.slice(1)].rels[field][0].includes(
                      'Many'
                    )
                      ? 'array'
                      : 'object',
                    required: false,
                    label: introspection[route.slice(1)].rels[field][3],
                    show: true
                  };
                }
              }
            }

            return acc;
          }, {} as any)}
        />
      ) : null}
      {introspection?.[route.slice(1)]?.media.length ? (
        <MediaTab value={tabValue} uuid={uuid || ''} route={path} />
      ) : null}
    </>
  );
};

export default observer(Item);
