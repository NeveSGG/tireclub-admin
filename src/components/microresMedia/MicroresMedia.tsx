import React, { FC, useCallback, useState } from 'react';
import {
  Card,
  IconButton,
  Button,
  Box,
  CardContent,
  Typography,
  CardActions
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileUpload from 'react-mui-fileuploader';

import { ExtendedFileProps } from 'react-mui-fileuploader/dist/types/index.types';

import notificationStore from 'store/NotificationStore';
import mainStore from 'store/MainStore';
import { truncateStringMidle } from 'helpers/functions';

interface IProps {
  fileUrl: string;
  formikValues: any;
  formikHandleChange(props: any): void;
  fieldName: string | undefined;
}

const MicroresMedia: FC<IProps> = ({
  fileUrl,
  formikValues,
  formikHandleChange,
  fieldName = 'media_url'
}) => {
  const [fileToUpload, setFileToUpload] = useState<Blob | null>(null);

  const deleteFile = useCallback(() => {
    formikHandleChange({ ...formikValues, [fieldName]: '' });
  }, [formikHandleChange, formikValues, fieldName]);

  const onError = useCallback((error: string) => {
    notificationStore.error(error);
  }, []);

  const uploadFile = () => {
    if (!fileToUpload) return;

    const formData = new FormData();
    formData.append('files[]', fileToUpload);

    const response = mainStore.uploadToMedia(formData);

    response.then((val) => {
      if (val.isOk) {
        formikHandleChange({ ...formikValues, [fieldName]: val.data[0].path });
        setFileToUpload(null);
      } else {
        notificationStore.error(val.msg);
      }
    });
  };

  return (
    <Box>
      {fileUrl ? (
        <Card sx={{ position: 'relative', height: 150, width: 150 }}>
          <CardContent>
            <DescriptionIcon />
            <Typography>
              {formikValues[fieldName]?.length > 20
                ? truncateStringMidle(formikValues[fieldName])
                : formikValues[fieldName]}
            </Typography>
          </CardContent>
          <CardActions>
            <IconButton onClick={deleteFile}>
              <DeleteOutlineIcon color="error" />
            </IconButton>
          </CardActions>
        </Card>
      ) : (
        <>
          <FileUpload
            onFilesChange={(files: ExtendedFileProps[]) => {
              setFileToUpload(files[0]);
            }}
            title="Загрузка файла"
            header="Переместите"
            leftLabel="или"
            rightLabel="чтобы загрузить"
            buttonLabel="НАЖМИТЕ"
            buttonRemoveLabel="Удалить выбранное"
            maxFileSize={50}
            maxUploadFiles={1}
            maxFilesContainerHeight={400}
            acceptedType={'*/*'}
            errorSizeMessage="Недопустимый размер файла"
            onError={onError}
            // fileSrc={logoFile}
            BannerProps={{ elevation: 0, variant: 'outlined' }}
            showPlaceholderImage={false}
            PlaceholderGridProps={{ md: 4 }}
            LabelsGridProps={{ md: 8 }}
            ContainerProps={{
              elevation: 0,
              variant: 'outlined',
              sx: { p: 2 }
            }}
          />
          <Button onClick={uploadFile} disabled={!fileToUpload}>
            Отправить
          </Button>
        </>
      )}
    </Box>
  );
};

export default MicroresMedia;
