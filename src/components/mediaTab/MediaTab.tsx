import React, { FC, useEffect, useState } from 'react';
import { Box, Typography, Stack, Skeleton } from '@mui/material';

import Media from 'components/media';

import mainStore from 'store/MainStore';
import notificationStore from 'store/NotificationStore';
import introspectionStore from 'store/IntrospectionStore';

import { IMediaData } from 'types/types';

import { observer } from 'mobx-react-lite';

interface IProps {
  value: number;
  uuid: string;
  route: string;
}

const index = 2;

const MediaTab: FC<IProps> = ({ value, uuid, route }) => {
  const [mediaFiles, setMediaFiles] = useState<IMediaData>({});
  const { mediaLoading } = mainStore;
  const { introspection } = introspectionStore;
  useEffect(() => {
    if (value === index) {
      const data = mainStore.getMedia(route, uuid);

      data.then((res) => {
        if (!res.isOk) {
          notificationStore.error(res.msg);
        } else {
          setMediaFiles(res.media);
        }
      });
    }
  }, [value, index, uuid, route]);

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
          {Object.entries(introspection[route.slice(1)].media).map(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ([_f, elem]) => {
              const { label, multiple, name, mime, key } = elem;

              return (
                <Stack
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    width: '100%',
                    pb: 1
                  }}
                  key={key}
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
                    {label}
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
                    {mediaLoading ? (
                      <Box sx={{ display: 'flex', gap: '21px' }}>
                        {Array.from({ length: multiple ? 4 : 1 }).map(
                          (val, ind) => (
                            <Skeleton
                              variant="rectangular"
                              // eslint-disable-next-line react/no-array-index-key
                              key={ind}
                              width={150}
                              height={150}
                            />
                          )
                        )}
                      </Box>
                    ) : (
                      <Media
                        route={route}
                        uuid={uuid}
                        slot={name}
                        label={label}
                        mimeTypes={mime}
                        multifile={multiple}
                        files={mediaFiles[name]}
                        setFiles={setMediaFiles}
                      />
                    )}
                  </Box>
                </Stack>
              );
            }
          )}
        </Box>
      )}
    </div>
  );
};

export default observer(MediaTab);
