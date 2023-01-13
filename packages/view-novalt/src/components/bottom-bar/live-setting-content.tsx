import { LiveCategoryList, User } from "@sopia-bot/core";
import { Chips } from "primereact/chips";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { ListBox } from "primereact/listbox";
import { MultiSelect } from "primereact/multiselect";
import { OverlayPanel } from "primereact/overlaypanel";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSpoon } from "../../plugins/spoon";
import { ToggleButton, ToggleButtonChangeParams } from 'primereact/togglebutton'
import { useQuery } from "@tanstack/react-query";

type Manager = User & {
	isManager: boolean;
}

export default function LiveSettingContent() {
  const [title, setTitle] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedCategories, setCategories] = useState([]);
  const [tags, setTags] = useState<string[]>([]);
  const [fixedManagerSearch, setFixedManagerSearch] = useState('');
  const [followers, setFollowers] = useState<Manager[]>([]);
  const searchResultPanel = useRef<OverlayPanel>(null);
  const searchInput = useRef(null);
  const { t } = useTranslation();
  const spoon = useSpoon();
  const { data: managerList, isSuccess } = useQuery({
    queryKey: ['getFixedManagers'],
    queryFn: async () => (await spoon.api.users.manager()).res.results,
  });

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

  const [tout, setTout] = useState<NodeJS.Timer|null>(null);
  const searchFollowers = async () => {
    if ( !isSuccess ) return;
    const req = await spoon.api.users.followers(spoon.logonUser, {
      params: {
        nickname: fixedManagerSearch,
      },
    });
    searchResultPanel.current?.show(null, searchInput.current);
    setFollowers(
			req.res.results.map((user) => ({
				...user,
				isManager: !!managerList.find(u => u.id === user.id),
			}) as Manager)
		);
  }

  const setManager = async (e: ToggleButtonChangeParams, user: Manager) => {
    const idx = managerList?.findIndex((u) => u.id === user.id) || -1;
    if ( user.isManager ) {
      await spoon.api.users.deleteManager(user.id); 
      user.isManager = false;
      if ( idx >= 0 ) {
        managerList?.splice(idx, 1);
      }
    } else {
      await spoon.api.users.setManager(user.id);
      user.isManager = true;
      if ( idx >= 0 ) {
        managerList?.push(user);
      }
    }
    setFollowers((followers || []).map((u) => {
      if ( u.id === user.id ) {
        return user;
      }
      return u;
    }));
    e.preventDefault();
  }

  useEffect(() => {
    if ( fixedManagerSearch ) {
      searchResultPanel.current?.hide();
      if ( tout ) {
        clearTimeout(tout);
        setTout(null);
      }
      setTout(setTimeout((() => searchFollowers()), 1000));
    }
  }, [fixedManagerSearch]);
  
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
          <span className='field' style={{ width: '100%' }}
              ref={searchInput}
          >
            <label htmlFor='fixed-manager' className='block text-sm'>{t('live.fixed_manager')}</label>
            <InputText
              value={fixedManagerSearch}
              onChange={(e) => setFixedManagerSearch(e.target.value)}
              id='fixed-manager'
              placeholder={t('live.fixed_manager_placeholder') || ''}
              style={{ width: '100%' }} />
            <OverlayPanel ref={searchResultPanel} id="search-panel">
              <ListBox
                options={followers}
                itemTemplate={(user: Manager) =>
                  <div className='flex align-items-center' onClick={() => {}}>
                    <div style={{
                      backgroundImage: `url(${user.profile_url})`,
                      width: '30px',
                      height: '30px',
                      borderRadius: '25px',
                      backgroundSize: 'contain',
                    }} className="mr-2"/>
                    <span className='mr-2'>{user.nickname}</span>
                    <span className='mr-2'>({user.tag})</span>
										<ToggleButton
                      checked={user.isManager}
                      className='p-button-sm'
                      style={{
                        padding: '0.15rem 0.8rem',
                      }}
                      onChange={(e) => setManager(e, user)}
                      onLabel={t('live.release')||''}
                      offLabel={t('live.assign')||''} />
                  </div>
                }/>
            </OverlayPanel>
          </span>
        </div>
      </div>
    </div>
  )
}