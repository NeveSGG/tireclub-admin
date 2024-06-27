import React, { FC, useCallback, useState } from 'react';
import { Card, CardMedia, IconButton, Button, Box } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileUpload from 'react-mui-fileuploader';
import { ExtendedFileProps } from 'react-mui-fileuploader/dist/types/index.types';

import environment from 'config/environments/environment';
import notificationStore from 'store/NotificationStore';
import { observer } from 'mobx-react-lite';
import mainStore from 'store/MainStore';

interface IProps {
  imageUrl: string;
  formikValues: any;
  formikHandleChange(props: any): void;
  fieldName: string | undefined;
}

const MicroresImage: FC<IProps> = ({
  imageUrl,
  formikValues,
  formikHandleChange,
  fieldName = 'image_url'
}) => {
  const [imageToUpload, setImageToUpload] = useState<Blob | null>(null);

  const deleteImage = useCallback(() => {
    formikHandleChange({ ...formikValues, [fieldName]: '' });
  }, [formikHandleChange, formikValues, fieldName]);

  const onError = useCallback((error: string) => {
    notificationStore.error(error);
  }, []);

  const uploadImage = () => {
    if (!imageToUpload) return;

    const formData = new FormData();
    formData.append('files[]', imageToUpload);

    const response = mainStore.uploadToMedia(formData);

    response.then((val) => {
      if (val.isOk) {
        formikHandleChange({ ...formikValues, [fieldName]: val.data[0].path });
        setImageToUpload(null);
      } else {
        notificationStore.error(val.msg);
      }
    });
  };

  return (
    <Box>
      {imageUrl ? (
        <Card sx={{ position: 'relative', height: 150, width: 150 }}>
          <CardMedia
            component="img"
            sx={{ height: 150, width: 150 }}
            image={`${environment.serverBaseUrl}/files/${imageUrl}`}
            alt="Обложка"
          />
          <IconButton
            sx={{ position: 'absolute', top: '10px', right: '10px' }}
            onClick={deleteImage}
          >
            <DeleteOutlineIcon color="error" />
          </IconButton>
        </Card>
      ) : (
        <>
          <FileUpload
            onFilesChange={(files: ExtendedFileProps[]) => {
              setImageToUpload(files[0]);
            }}
            title="Загрузка обложки"
            header="Переместите"
            leftLabel="или"
            rightLabel="чтобы загрузить"
            buttonLabel="НАЖМИТЕ"
            buttonRemoveLabel="Удалить выбранное"
            maxFileSize={20}
            maxUploadFiles={1}
            maxFilesContainerHeight={400}
            acceptedType={'image/*'}
            errorSizeMessage="Недопустимый размер изображений"
            onError={onError}
            BannerProps={{ elevation: 0, variant: 'outlined' }}
            showPlaceholderImage={false}
            PlaceholderGridProps={{ md: 4 }}
            LabelsGridProps={{ md: 8 }}
            ContainerProps={{
              elevation: 0,
              variant: 'outlined',
              sx: { p: 2 }
            }}
            PlaceholderImageDimension={{
              xs: { width: 512, height: 512 },
              sm: { width: 512, height: 512 },
              md: { width: 512, height: 512 },
              lg: { width: 512, height: 512 }
            }}
          />
          <Button onClick={uploadImage} disabled={!imageToUpload}>
            Отправить
          </Button>
        </>
      )}
    </Box>
  );
};

export default observer(MicroresImage);
