import React, { FC, memo, useCallback, useEffect, useState } from 'react';
import {
  Box,
  Modal,
  Backdrop,
  Fade,
  IconButton,
  Button,
  TextField,
  LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';

import { DropzoneDialog, AlertType } from 'mui-file-dropzone';

import './editor.scss';
import notificationStore from 'store/NotificationStore';
import mainStore from 'store/MainStore';

import environment from 'config/environments/environment';

import { IMedia } from 'types/types';

import { observer } from 'mobx-react-lite';

const defaults = {
  init: {
    width: '100%',
    height: '700px',
    menubar: true,
    branding: false,
    plugins: [
      'link',
      'lists',
      'advlist',
      'anchor',
      'code',
      'autolink',
      'autosave',
      'codesample',
      'emoticons',
      'help',
      'importcss',
      'insertdatetime',
      'link',
      'lists',
      'pagebreak',
      'save',
      'paste',
      'searchreplace',
      'table',
      'visualblocks',
      'visualchars',
      'wordcount',
      'autosave',
      'charmap',
      'anchor',
      'quickbars'
    ],
    toolbar:
      'undo redo fullscreen | bold italic underline strikethrough | fontselect fontsizeinput formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | InsertMediaButton link insertdatetime table | visualblocks visualchars | help | searchreplace wordcount preview',
    language: 'ru',
    // skin: 'oxide-dark',
    toolbar_sticky: true,
    autosave_ask_before_unload: true,
    autosave_interval: '10s',
    autosave_prefix: '{path}{query}-{id}-',
    autosave_restore_when_empty: false,
    autosave_retention: '2m',
    image_advtab: true,
    importcss_append: true,
    image_caption: true,
    quickbars_selection_toolbar:
      'bold italic | quicklink h1 h2 h3 | blockquote quicktable',
    quickbars_insert_toolbar: false,
    noneditable_noneditable_class: 'mceNonEditable',
    contextmenu:
      'bold italic underline strikethrough fontsizeinput | link | imagetools | table',
    font_size_formats:
      '8pt 9pt 10pt 11pt 12pt 14pt 18pt 24pt 30pt 36pt 48pt 60pt 72pt 96pt',
    fontsize_formats:
      '8pt 9pt 10pt 11pt 12pt 14pt 18pt 24pt 30pt 36pt 48pt 60pt 72pt 96pt'
  }
};

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '1600px',
  height: '90vh',
  bgcolor: 'background.paper',
  border: '1px solid #B9C6DF',
  overflow: 'scroll',
  boxShadow: 24,
  p: '48px 16px 16px 16px'
};

interface IProps {
  onEditorChange(value: any): void;
  value: string | undefined;
  id: string;
  width?: string;
  height?: string;
  formikValues: any;
  formikHandleChange: (props: any) => void;
}

const Editor: FC<IProps> = ({
  onEditorChange,
  value,
  id,
  width,
  height,
  formikValues,
  formikHandleChange
}) => {
  const [editorLoading, setEditorLoading] = useState<boolean>(false);
  const [open, setOpened] = useState<boolean>(false);
  const [mode, setMode] = useState<'code' | 'visual'>('visual');

  const [imagesToUpload, setImagesToUpload] = useState<File[]>([]);
  const [editorObj, setEditorObject] = useState<any>(null);
  const [imagesModalOpen, setImagesModalOpen] = useState<boolean>(false);

  const handleClose = useCallback(() => {
    setOpened(false);
  }, [setOpened]);

  const uploadImages = (editor: any) => (files: File[]) => {
    if (!files) return;

    const formData = new FormData();
    files.forEach((image) => {
      formData.append('files[]', image);
    });

    const response = mainStore.uploadToMedia(formData);

    response.then((val) => {
      if (val.isOk) {
        val.data.forEach((el: IMedia) => {
          editor.insertContent(
            `<img src="${environment.serverBaseUrl}/files/${el.path}" />`
          );
        });
        setImagesModalOpen(false);
      } else {
        notificationStore.error(val.msg);
      }
    });
  };

  useEffect(() => {
    if (mode === 'visual' && open === true) {
      setEditorLoading(true);
    }
  }, [mode, open]);

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <Modal
        aria-labelledby={id}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        disableEnforceFocus
        slots={{ backdrop: Backdrop }}
        sx={{ pb: 0, mb: 0 }}
      >
        <Fade in={open} style={{ backgroundColor: '#eff2f9' }}>
          <Box sx={style}>
            {editorLoading && <LinearProgress />}
            {mode === 'visual' ? (
              <TinyMCEEditor
                id={id}
                onLoadContent={() => {
                  setEditorLoading(false);
                }}
                init={{
                  ...defaults.init,
                  width: width || defaults.init.width,
                  height: height || defaults.init.height,
                  id,
                  setup: (editor) => {
                    editor.ui.registry.addButton('InsertMediaButton', {
                      text: 'Вставить изображение',
                      onAction: () => setImagesModalOpen(true)
                    });
                    editor.ui.show();
                  }
                }}
                value={value}
                onEditorChange={(newVal) => {
                  formikHandleChange({
                    ...formikValues,
                    [id]: newVal
                  });
                }}
                onInit={(evt, editor) => setEditorObject(editor)}
                apiKey={environment.tinymceApiKey}
              />
            ) : (
              <TextField
                id={id}
                variant="outlined"
                fullWidth
                multiline
                minRows={33}
                maxRows={33}
                value={value}
                onChange={onEditorChange}
              />
            )}
            <IconButton
              sx={{
                position: 'absolute',
                top: 4,
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

      <Button
        color="info"
        variant="contained"
        onClick={() => {
          setMode('visual');
          setOpened(true);
        }}
      >
        Визуальный редактор
      </Button>
      <Button
        variant="contained"
        onClick={() => {
          setMode('code');
          setOpened(true);
        }}
      >
        Режим кода
      </Button>
      <DropzoneDialog
        open={imagesModalOpen}
        onSave={uploadImages(editorObj)}
        onChange={(files) => {
          setImagesToUpload(files);
        }}
        filesLimit={10}
        dialogTitle="Загрузка изображений"
        previewText="Выбранные файлы"
        dropzoneText="Нажмите сюда или перенесите файлы для загрузки"
        cancelButtonText="Отменить"
        submitButtonText="Загрузить"
        getFileLimitExceedMessage={(num: number) => {
          return `Превышен лимит по файлам. Максимальное количество - ${num}`;
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
        acceptedFiles={['image/jpeg', 'image/png', 'image/bmp']}
        fileObjects={imagesToUpload}
        showPreviews
        maxFileSize={5000000}
        onClose={() => setImagesModalOpen(false)}
      />
    </div>
  );
};

export default memo(observer(Editor));
