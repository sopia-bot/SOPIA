import { User } from "@sopia-bot/core";
import { useQuery } from "@tanstack/react-query";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { OverlayPanel } from "primereact/overlaypanel";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSpoon } from "../../plugins/spoon";

type Manager = User & {
  isManager: boolean;
}

type FixManagerInputProps = {
  searchInput: MutableRefObject<any>;
}

export default function FixManagerInput(props: FixManagerInputProps) {
  const [fixedManagerSearch, setFixedManagerSearch] = useState('');
  const [followers, setFollowers] = useState<Manager[]>([]);
  const searchResultPanel = useRef<OverlayPanel>(null);

  const spoon = useSpoon();
  const { data: managerList, isSuccess } = useQuery({
    queryKey: ['getFixedManagers'],
    queryFn: async () => (await spoon.api.users.manager()).res.results,
  });
  const { t } = useTranslation();

  const [tout, setTout] = useState<NodeJS.Timer|null>(null);
  const searchFollowers = async () => {
    if ( !isSuccess ) return;
    const req = await spoon.api.users.followers(spoon.logonUser, {
      params: {
        nickname: fixedManagerSearch,
      },
    });
    if ( props.searchInput?.current ) {
      searchResultPanel.current?.show(null, props.searchInput.current);
    }
    setFollowers(
      req.res.results.map((user) => ({
        ...user,
        isManager: !!managerList.find(u => u.id === user.id),
      }) as Manager)
    );
  }

  const setManager = async (user: Manager) => {
    const idx = managerList?.findIndex((u) => u.id === user.id) || -1;
    if ( user.isManager ) {
      await spoon.api.users.deleteManager(user.id); 
      user.isManager = false;
      if ( idx >= 0 ) {
        managerList?.splice(idx, 1, user);
      }
    } else {
      await spoon.api.users.setManager(user.id);
      user.isManager = true;
      if ( idx >= 0 ) {
        managerList?.push(user);
      } else {
        managerList?.splice(idx, 1, user);
      }
    }
    setFollowers((followers || []).map((u) => {
      if ( u.id === user.id ) {
        return user;
      }
      return u;
    }));
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

  return <>
  <InputText
    value={fixedManagerSearch}
    onChange={(e) => setFixedManagerSearch(e.target.value)}
    id='fixed-manager'
    placeholder={t('live.fixed_manager_placeholder') || ''}
    style={{ width: '100%' }} />
  <OverlayPanel ref={searchResultPanel} id="search-panel">
    {
      followers.map((user: Manager) =>
      <div key={user.id} className='flex align-items-center' onClick={() => {}}>
        <div style={{
          backgroundImage: `url(${user.profile_url})`,
          width: '30px',
          height: '30px',
          borderRadius: '25px',
          backgroundSize: 'contain',
        }} className="mr-2"/>
        <span className='mr-2'>{user.nickname}</span>
        <span className='mr-2'>({user.tag})</span>
        <Button
          className={(user.isManager ? 'p-button-primary' : 'p-button-outlined') + ' p-button-sm'}
          style={{
            padding: '0.15rem 0.8rem',
          }}
          onClick={(e) => setManager(user)}
          label={(user.isManager ? t('live.release') : t('live.assign')) || ''}/>
      </div>
      )
    }
  </OverlayPanel>
  </>
}