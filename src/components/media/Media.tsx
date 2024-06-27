import React, { FC, useCallback, useState } from 'react';
import {
  Button,
  Box,
  Card,
  CardMedia,
  IconButton,
  CardContent,
  CardActions,
  Typography
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArticleIcon from '@mui/icons-material/Article';
import AddIcon from '@mui/icons-material/Add';
import { DropzoneDialog, AlertType } from 'mui-file-dropzone';
import SortableList, { SortableItem } from 'react-easy-sort';
import { IMedia, IMediaData } from 'types/types';
import environment from 'config/environments/environment';
import notificationStore from 'store/NotificationStore';
import mainStore from 'store/MainStore';
import { truncateStringMidle } from 'helpers/functions';

interface IProps {
  route: string;
  uuid: string;
  slot: string;
  label?: string;
  multifile?: boolean;
  mimeTypes?: Array<string>;
  files: Array<IMedia>;
  setFiles(
    newImages: IMediaData | ((oldImages: IMediaData) => IMediaData)
  ): void;
}

interface IMediaItemProps {
  file: IMedia;
  label: string;
  deleteFile: (f: IMedia) => () => void;
}

const MediaItem: FC<IMediaItemProps> = ({ file, label, deleteFile }) => {
  switch (file.mime_global_type) {
    case 'image': {
      return (
        <Card
          sx={{
            cursor: '-webkit-grab',
            position: 'relative'
          }}
        >
          <CardMedia
            component="img"
            height="150"
            sx={{
              pointerEvents: 'none'
            }}
            image={`${environment.serverBaseUrl}/files/${file.path}`}
            alt={label}
          />
          <IconButton
            sx={{
              position: 'absolute',
              top: '5px',
              right: '5px'
            }}
            onClick={deleteFile(file)}
          >
            <DeleteOutlineIcon color="error" />
          </IconButton>
        </Card>
      );
    }
    case 'video': {
      return (
        <Card
          sx={{
            cursor: '-webkit-grab',
            position: 'relative'
          }}
        >
          <CardMedia
            component="video"
            sx={{
              pointerEvents: 'none'
            }}
            height="150"
            src={`${environment.serverBaseUrl}/files/${file.path}`}
            title={label}
          />
          <IconButton
            sx={{
              position: 'absolute',
              top: '5px',
              right: '5px'
            }}
            onClick={deleteFile(file)}
          >
            <DeleteOutlineIcon color="error" />
          </IconButton>
        </Card>
      );
    }
    default: {
      return (
        <Card
          sx={{
            cursor: '-webkit-grab',
            position: 'relative'
          }}
        >
          <CardContent>
            <ArticleIcon />
            <Typography>
              {file.path.length > 20
                ? truncateStringMidle(file.path)
                : file.path}
            </Typography>
          </CardContent>
          <CardActions>
            <IconButton onClick={deleteFile(file)}>
              <DeleteOutlineIcon color="error" />
            </IconButton>
          </CardActions>
        </Card>
      );
    }
  }
};

const Media: FC<IProps> = ({
  route,
  uuid,
  slot,
  label = 'Файл',
  multifile = false,
  mimeTypes = [],
  files,
  setFiles
}) => {
  const [dropzoneOpened, setDropzoneOpened] = useState<boolean>(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

  const deleteFile = (image: IMedia) => () => {
    const { id } = image;
    const res = mainStore.deleteImage(id);

    res.then((val) => {
      if (val.isOk) {
        setFiles((obj) => ({
          ...obj,
          [slot]: files.filter((img) => img.id !== id)
        }));
      }
    });
  };

  const onSortEnd = (oldIndex: number, newIndex: number) => {
    const oldSort = files[oldIndex].sort;
    const newSort = files[newIndex].sort;

    const imagesCopy = [...files];

    if (typeof newSort === 'number' && typeof oldSort === 'number') {
      let newArr = [] as IMedia[];
      setFiles((obj) => {
        const arrCopy = [...obj[slot]];
        const movedItem = arrCopy[oldIndex];
        arrCopy.splice(oldIndex, 1);
        arrCopy.splice(newIndex, 0, movedItem);
        const arrCopy2 = arrCopy.map((el, ind) => ({ ...el, sort: ind }));
        newArr = [...arrCopy2];
        return { ...obj, [slot]: arrCopy2 };
      });
      const resp = mainStore.assignMedia(route, uuid, slot, [...newArr]);

      resp.then((val) => {
        if (val.isOk) {
          notificationStore.success('Порядок изменён');
        } else {
          notificationStore.error('Ошибка при попытки изменить порядок');
          setFiles((obj) => ({ ...obj, [slot]: [...imagesCopy] }));
        }
      });
    } else {
      notificationStore.error('Невозможно изменить порядок');
    }
  };

  const uploadGalleryImages = useCallback(
    (newFiles: File[]) => {
      if (!newFiles) return;

      const formData = new FormData();
      newFiles.forEach((image) => {
        formData.append('files[]', image);
      });

      const response = mainStore.uploadMedia(route, uuid, slot, formData);

      response.then((val) => {
        if (val.isOk) {
          const newResp = mainStore.getMedia(route, uuid);

          setFilesToUpload([]);
          setDropzoneOpened(false);

          newResp.then((newVal) => {
            if (newVal.isOk) {
              notificationStore.success('Изображения загружены');
              setFiles((obj) => ({ ...obj, [slot]: [...newVal.media[slot]] }));
            } else {
              notificationStore.error(newVal.msg);
            }
          });
        } else {
          notificationStore.error(val.msg);
        }
      });
    },
    [mainStore.uploadMedia, setFiles, setFilesToUpload, setDropzoneOpened]
  );

  return (
    <>
      <DropzoneDialog
        open={dropzoneOpened}
        onSave={uploadGalleryImages}
        onChange={(newFiles) => setFilesToUpload(newFiles)}
        filesLimit={multifile ? 50 : 1}
        dialogTitle="Загрузка файлов"
        previewText="Выбранные файлы"
        dropzoneText="Нажмите сюда или перенесите файлы"
        cancelButtonText="Отменить"
        submitButtonText="Загрузить"
        getFileLimitExceedMessage={(num: number) => {
          return `Превышен лимит по количеству файлов. Максимальное количество - ${num}`;
        }}
        getFileAddedMessage={(name: string) => {
          return `Файл ${name} успешно добавлен`;
        }}
        getFileRemovedMessage={(name: string) => {
          return `Файл ${name} успешно удалён`;
        }}
        onAlert={(mes: string, mesType: AlertType) => {
          notificationStore[mesType](mes);
        }}
        acceptedFiles={mimeTypes}
        fileObjects={filesToUpload}
        showPreviews
        showFileNames
        useChipsForPreview
        showAlerts={['error']}
        maxFileSize={640000000}
        onClose={() => setDropzoneOpened(false)}
      />
      {files && files.length ? (
        <SortableList
          onSortEnd={onSortEnd}
          style={{
            display: 'flex',
            paddingLeft: '40px',
            paddingRight: '40px',
            flexWrap: 'wrap',
            gap: '20px',
            userSelect: 'none'
          }}
        >
          {files.map((item) => (
            <SortableItem key={item.id}>
              <Box
                style={{
                  position: 'relative',
                  flexShrink: 0,
                  cursor: 'grab',
                  userSelect: 'none',
                  borderRadius: '100%'
                }}
              >
                <MediaItem file={item} deleteFile={deleteFile} label={label} />
              </Box>
            </SortableItem>
          ))}
          {multifile && (
            <Box
              sx={{
                width: '150px',
                height: '150px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <IconButton onClick={() => setDropzoneOpened(true)}>
                <AddIcon />
              </IconButton>
            </Box>
          )}
        </SortableList>
      ) : (
        <Button onClick={() => setDropzoneOpened(true)}>Добавить</Button>
      )}
    </>
  );
};

export default Media;
