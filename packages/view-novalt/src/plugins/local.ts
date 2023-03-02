
type LocalReturnType = string|undefined|Record<string, unknown>|null;
const KEY_PREFIX = 'SOPIA_';

const localRead = <T extends any>(key: string, convert?: (s: string) => T): T|LocalReturnType => {
  if ( typeof window.localStorage !== 'undefined' ) {
    let ret: T|LocalReturnType = window.localStorage.getItem(`${KEY_PREFIX}${key}`);

    if ( !ret ) {
      return;
    }

    if ( typeof convert === 'function' ) {
      ret = convert(ret) as T;
    }

    return ret;
  } else {
    console.error('Do not support localStorage');
  }
};

const localWrite = (key: string, val: any): void => {
  if ( typeof window.localStorage !== 'undefined' ) {
    switch ( typeof val ) {
      case 'object':
      val = JSON.stringify(val);
      break;
      default:
      val = val.toString();
    }

    window.localStorage.setItem(`${KEY_PREFIX}${key}`, val as string);
  } else {
    console.error('Do not support localStorage');
  }
};

const localDelete = (key: string) => {
  if ( typeof window.localStorage !== 'undefined' ) {
    window.localStorage.removeItem(`${KEY_PREFIX}${key}`);
  } else {
    console.error('Do not support localStorage');
  }
}

export default {
  read: localRead,
  write: localWrite,
  delete: localDelete,
};