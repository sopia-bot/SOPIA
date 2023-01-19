import { LiveCategoryList } from "@sopia-bot/core";
import { Chips } from "primereact/chips";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect } from "primereact/multiselect";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileUpload } from 'primereact/fileupload';
import { Button } from "primereact/button";
import { LiveSettingDto } from '@sopia-bot/bridge/dist/dto';
import FixManagerInput from "./manager-input";


export type LiveSettingContentProps = {
  value: LiveSettingDto,
  onChange: (value: LiveSettingContentProps['value']) => void;
};

export default function LiveSettingContent(props: LiveSettingContentProps) {
  const [title, setTitle] = useState(props.value.title);
  const [notice, setNotice] = useState(props.value.welcome_message);
  const [selectedCategories, setCategories] = useState(props.value.categories);
  const [tags, setTags] = useState<string[]>(props.value.tags);
  
  const [image, setImage] = useState<Buffer>(props.value.image || Buffer.from([]));
  const [imgUrl, setImgUrl] = useState('');
  const searchInput = useRef(null);
  const imageUploadRef = useRef(null);
  const { t } = useTranslation();

  const categoryItemTemplate = (option: (typeof LiveCategoryList)[0]) => (
    <div>
      {option.emoji} {t(`live.categories.${option.name}`)}
    </div>
  );
  const selectedCategoryTemplate = (option: (typeof LiveCategoryList)[0]) => {
    if ( !option ) return <div>{t('live.select_category')}</div>
    return <span style={{
      backgroundColor: 'var(--pink-50)',
      padding: '3px 8px',
      borderRadius: '5px',
    }} className='mr-1'>
      {option?.emoji} {t(`live.categories.${option?.name}`)}
    </span>
  };

  const onSelectImage = async (e: any) => {
    const buffer = await e.files[0].arrayBuffer();
    setImage(Buffer.from(buffer));
  }

  const removeImg = () => {
    setImage(Buffer.from([]));
    setImgUrl('');
  }

  useEffect(() => {
    props.onChange({
      title,
      welcome_message: notice,
      categories: selectedCategories,
      tags,
      spoon_aim: [],
      image: image.length ? image : undefined,
    });
  }, [title, notice, selectedCategories, tags, image]);

  useEffect(() => {
    if ( image.length ) {
      const blob = new Blob([ image ]);
      const url = URL.createObjectURL(blob);
      setImgUrl(url);
    }
  }, [image]);
  
  return (
    <div style={{
      width: '800px',
      height: '60vh',
      maxHeight: '60vh',
      overflow: 'auto',
    }} className='flex flex-row'>
      <div className='flex-1 flex-column mr-2'>
        <div className='flex'>
          <span className="field" style={{ width: '100%' }}>
            <label htmlFor="category-select" className='block text-sm'>{t('live.category')}</label>
            <MultiSelect
              id="category-select"
              style={{ width: '100%' }}
              value={selectedCategories}
              onChange={(e) => setCategories(e.value)}
              options={LiveCategoryList}
              placeholder={t('live.select_category') || ''}
              itemTemplate={categoryItemTemplate}
              selectedItemTemplate={selectedCategoryTemplate} />
          </span>
        </div>
        <div className='flex'>
          <span className='field' style={{ width: '100%' }}>
            <label htmlFor='title' className='block text-sm'>{t('live.title')}</label>
            <InputText
              id="title"
              style={{ width: '100%' }}
              className="block"
              value={title}
              onChange={(e) => setTitle(e.target.value)}/>
          </span>
        </div>
        <div className='flex'>
          <span className='field' style={{ width: '100%' }}>
            <label htmlFor='tags' className='block text-sm mb-0'>{t('live.hashtag')}</label>
            <label htmlFor='tags' className='block text-xs'>{t('live.hashtag_description')}</label>
            <Chips style={{ width: '100%' }} id="tags" value={tags} onChange={(e) => setTags(e.target.value)}/>
          </span>
        </div>
        <div className='flex'>
          <span className='field' style={{ width: '100%' }}>
            <label htmlFor='notice' className='block text-sm'>{t('live.notice')}</label>
            <InputTextarea
              id="notice"
              autoResize
              rows={5}
              value={notice}
              style={{ width: '100%', overflow: 'auto !important', maxHeight: '120px' }}
              onChange={(e) => setNotice(e.target.value)} />
          </span>
        </div>
      </div>
      <div className='flex-1 flex-column ml-2'>
        <div className='flex'>
          <span
            className='field'
            style={{ width: '100%' }}
            ref={searchInput}>
            <label htmlFor='fixed-manager' className='block text-sm'>{t('live.fixed_manager')}</label>
            <FixManagerInput searchInput={searchInput} />
          </span>
        </div>
        <div className='flex'>
          <span
            className='field'
            style={{ width: '100%' }}>
            <label htmlFor='upload-image' className='block text-sm'>{t('live.upload_image')}</label>
            <FileUpload
              ref={imageUploadRef}
              accept="image/*"
              maxFileSize={1024 * 1024 * 5}
              contentStyle={{ display: 'none', }}
              onSelect={onSelectImage}
              chooseOptions={{icon: 'pi pi-fw pi-images', iconOnly: true, className: 'custom-choose-btn p-button-rounded p-button-outlined'}}
              cancelOptions={{icon: 'pi pi-fw pi-times', iconOnly: true, className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined'}}
              headerTemplate={({ chooseButton, cancelButton, className }) =>
              <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
                {chooseButton}
                <Button
                  disabled={!imgUrl}
                  onClick={removeImg}
                  className="custom-choose-btn p-button-rounded p-button-outlined p-button-danger"
                  icon="pi pi-fw pi-times" />
              </div>}/>
              <div style={{
                border: '1px solid #dee2e6',
                padding: '1rem',
              }}>
                <div className="flex align-items-center flex-wrap">
                  <div style={{
                    width: '100%',
                    height: '200px',
                    backgroundImage: `url(${imgUrl})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}>
                  </div>
                </div>
              </div>
          </span>
        </div>
      </div>
    </div>
  )
}