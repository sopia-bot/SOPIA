
type SessionReturnType = string|undefined|Record<string, unknown>|null;

const KEY_PREFIX = 'SOPIA_'

const sessionRead = <T extends object>(key: string, convert?: (s: string) => T): T|SessionReturnType => {
  if ( typeof window.sessionStorage !== 'undefined' ) {
    let ret: T|SessionReturnType = window.sessionStorage.getItem(`${KEY_PREFIX}${key}`);

    if ( !ret ) {
      return;
    }

    if ( typeof convert === 'function' ) {
      ret = convert(ret) as T;
    }

    return ret;
  } else {
    console.error('Do not support sessionStorage');
  }
};

const sessionWrite = (key: string, val: any): void => {
  if ( typeof window.sessionStorage !== 'undefined' ) {
    switch ( typeof val ) {
      case 'object':
      val = JSON.stringify(val);
      break;
      default:
      val = val.toString();
    }

    window.sessionStorage.setItem(`${KEY_PREFIX}${key}`, val as string);
  } else {
    console.error('Do not support sessionStorage');
  }
};

export interface Session {
  read: <T extends object>(key: string, type: (s: string) => T) => T|SessionReturnType;
  write: (key: string, val: any) => void;
}

export default {
  read: sessionRead,
  write: sessionWrite,
};
