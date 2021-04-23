#include <Windows.h>
#include <stdio.h>
#include <TlHelp32.h>
#include <string>
#include <napi.h>

#define MAX_BUF 256

using std::string;

char *AnsiToUTF8RetString( char *InputStr )
{
    WCHAR szUnicode[MAX_BUF];
    char szUTF8char[MAX_BUF];

    char* szSrc = (LPSTR)(LPCTSTR)InputStr;

    char szRetVale[MAX_BUF] = "";


    //  EUC-KR 케릭터셋의 ANSI 문자를 유니코드로 변환
    int UnicodeSize = MultiByteToWideChar( CP_ACP, 0, szSrc, (int)strlen( szSrc ), szUnicode, sizeof( szUnicode ) );

    //  유니코드를 UTF-8 케릭터셋의 ANSI 문자로 변환
    int UTF8CodeSize = WideCharToMultiByte( CP_UTF8, 0, szUnicode, UnicodeSize, szUTF8char, sizeof( szUTF8char ), NULL, NULL );

    memcpy( szRetVale, szUTF8char, UTF8CodeSize );

    return szRetVale;
}

DWORD FindProcessFirstByName(const char *processName, int cnt)
{
	HANDLE snapshot = CreateToolhelp32Snapshot( TH32CS_SNAPPROCESS, 0 );
	int i = 0;
	if ( snapshot != INVALID_HANDLE_VALUE ) {
		PROCESSENTRY32 pe32 = { sizeof( PROCESSENTRY32 ) };
		if ( Process32First( snapshot, &pe32 ) ) {
			do {
				if ( strcmp( pe32.szExeFile, processName ) == 0 ) {
					//wprintf( L"[%d] %s\n", pe32.th32ProcessID, pe32.szExeFile );
					//printf( "i = %d, cnt = %d\n", i, cnt );
					if ( i++ == cnt )
						return pe32.th32ProcessID;
				}
			} while ( Process32Next( snapshot, &pe32 ) );
		}
		CloseHandle( snapshot );
	}
	return 0;
}

ULONG ProcIDFromWnd( HWND hwnd ) // 윈도우 핸들로 프로세스 아이디 얻기  
{
	ULONG idProc;
	GetWindowThreadProcessId( hwnd, &idProc );
	return idProc;
}

HWND GetWinHandle( ULONG pid ) // 프로세스 아이디로 윈도우 핸들 얻기  
{
	HWND tempHwnd = FindWindow( NULL, NULL ); // 최상위 윈도우 핸들 찾기  

	while ( tempHwnd != NULL ) {
		if ( GetParent( tempHwnd ) == NULL ) // 최상위 핸들인지 체크, 버튼 등도 핸들을 가질 수 있으므로 무시하기 위해  
			if ( pid == ProcIDFromWnd( tempHwnd ) )
				return tempHwnd;
		tempHwnd = GetWindow( tempHwnd, GW_HWNDNEXT ); // 다음 윈도우 핸들 찾기  
	}
	return NULL;
}

char *change_title_singer(char *song, char *buf, int buflen)
{
	int song_len = strlen(song);
	char title[MAX_BUF], singer[MAX_BUF];
	int i = 0, idx = 0;

	for (idx = 0;i<song_len;i++, idx++) {
		if ( song[i+1] == '-' )
			break;
		title[idx] = song[i];
	}

	for ( i += 2, idx=0;i < song_len;i++, idx++) {
		singer[idx] = song[i];
	}

	snprintf(buf, buflen, "%s - %s - melon", singer, title);
	return buf;
}

Napi::String getNowSong(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

	HWND h_wnd = ::FindWindow("MelOnFrameV40", NULL);
	char *title = new char[MAX_BUF];
	char *buf = new char[MAX_BUF];
    char *encodeTitle = NULL;
	int get_title = 0, need_change = 0;

	if ( h_wnd == 0 ) {
		h_wnd = ::FindWindow( "{97E27FAA-C0B3-4b8e-A693-ED7881E99FC1}", NULL );
	}
	
	if ( h_wnd == 0 ) {
		DWORD processId = FindProcessFirstByName( "Melon Player.exe", 0 );
		h_wnd = GetWinHandle(processId);
	}

	if ( get_title == 0 ) {
		GetWindowTextA( h_wnd, (LPSTR)title, MAX_BUF );
	}

	if ( need_change == 1 ) {
		title = change_title_singer(title, buf, MAX_BUF);
	}
    
	if ( get_title == 1 ) {
		return Napi::String::New(env, title);
	} else {
		encodeTitle = AnsiToUTF8RetString( title );
		return Napi::String::New(env, encodeTitle);
	}
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "getNowSong"),
        Napi::Function::New(env, getNowSong));
    return exports;
}

NODE_API_MODULE(getNowSong, Init)