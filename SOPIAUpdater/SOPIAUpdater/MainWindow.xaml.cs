using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using System.Windows.Threading;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Schema;

namespace SOPIAUpdater
{
	/// <summary>
	/// MainWindow.xaml에 대한 상호 작용 논리
	/// </summary>
	public partial class MainWindow : Window
	{
		private const string ApiUrl = "https://sopia-bot.firebaseio.com";
		private string BasePath = "./";
		private string reqVer = "latest";

		static string GetMd5Hash( MD5 md5Hash, string input )
		{
			// Convert the input string to a byte array and compute the hash.
			byte[] data = md5Hash.ComputeHash(Encoding.UTF8.GetBytes(input));
			
			// Create a new Stringbuilder to collect the bytes
			// and create a string.
			
			StringBuilder sBuilder = new StringBuilder();
			
			// Loop through each byte of the hashed data
			// and format each one as a hexadecimal string.
			
			
			for (int i = 0; i < data.Length; i++) {
				sBuilder.Append(data[i].ToString("x2"));
			}
			
			// Return the hexadecimal string.
			return sBuilder.ToString();
		}

		private string ToMD5( string filename )
		{
			MD5 md5 = MD5.Create();

			if ( File.Exists( filename ) ) {
				using (Stream stream = File.OpenRead(filename)) {
					byte[] hash = md5.ComputeHash( stream );
					return BitConverter.ToString( hash ).Replace( "-", "" ).ToLowerInvariant();
				}
			} else {
				Console.WriteLine( "File Not Exists [" + filename + "]" );
			}
			return "";
		}

		private string httpReq(string url)
		{
			string rtext = string.Empty;
			HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
			request.Method = "GET";
			request.Timeout = 30000;

			using ( HttpWebResponse response = (HttpWebResponse)request.GetResponse() ) {
				Stream RStream = response.GetResponseStream();
				using ( StreamReader sr = new StreamReader( RStream ) ) {
					rtext = sr.ReadToEnd();
				}
			}
			return rtext;
		}
		string DBREQ(string path)
		{
			string flag = path[0] == '/' ? "" : "/";
			return httpReq( ApiUrl + flag + path );
		}
		JArray DBGetArr( string path )
		{
			return JArray.Parse( DBREQ( path ) );
		}
		JObject DBGetObj( string path )
		{
			return JObject.Parse( DBREQ( path ) );
		}
		string DBGetStr( string path )
		{
			return Regex.Replace( DBREQ(path), "^\"|\"$", "" );
		}

		public MainWindow()
		{
			InitializeComponent();

			string[] args = Environment.GetCommandLineArgs();
			if ( args.Length >= 3 ) {
				string bp = args[1];
				if ( bp[bp.Length - 1] != '/' ) {
					bp += "/";
				}
				BasePath = bp;

				reqVer = args[2];
				if ( reqVer == "latest" ) {
					reqVer = DBGetStr( "/app/update/version.json" );
				}
			} else {
				MessageBox.Show( "실행에 필요한 인자가 부족합니다.", "알림" );
				System.Windows.Application.Current.Shutdown();
			}
		}

		private void Grid_MouseDown( object sender, MouseButtonEventArgs e )
		{
			if ( e.ChangedButton == MouseButton.Left )
				this.DragMove();
		}

		private string GetSPath(string path)
		{
			string p = Regex.Replace( path, "^/", "" );
			return BasePath + p;
		}


		private async Task DoUpdate()
		{
			JArray dep = DBGetArr( "/app/update/"+reqVer.Replace('.', '-')+".json" );
			WebClient client = new WebClient();

			UpdateProgress.Maximum = dep.Count;
			for ( int i = 0; i < dep.Count; i++ ) {
				JObject info = dep[i] as JObject;
				string target = GetSPath(info["name"].ToString());
				bool update = false;
				if ( File.Exists( target ) ) {
					string hash = ToMD5( target );
					if ( hash != info["hash"].ToString() ) {
						update = true;
					}
				} else {
					update = true;
				}

				if ( update ) {
					string dir = Path.GetDirectoryName(target);
					if ( !Directory.Exists( dir ) ) {
						Directory.CreateDirectory( dir );
					}
					DescLabel.Content = Path.GetFileName( target ) + "을(를) 다운받습니다.";
					client.DownloadFile( info["url"].ToString(), target );
				} else {
					DescLabel.Content = Path.GetFileName( target ) + "은(는) 최신 파일입니다.";
				}
				await Task.Delay( 200 );

				int per = (i+1) / dep.Count * 100;
				ProgressLabel.Content = per + "%";

				UpdateProgress.Value = i + 1;

				await Task.Delay( 500 );
			}

			JObject cfg = JObject.Parse( File.ReadAllText( GetSPath( "/config.json" ) ) );
			cfg["version"] = reqVer;

			File.WriteAllText( GetSPath( "/config.json" ), cfg.ToString() );
		}

		private async void Window_ContentRendered( object sender, EventArgs e )
		{
			DescLabel.Content = reqVer + " 버전을 확인합니다.";
			await Task.Delay( 2000 );
			
			await DoUpdate();
			
			DescLabel.Content = "업데이트를 완료했습니다.";

			await Task.Delay( 2000 );
			this.Close();
			System.Windows.Application.Current.Shutdown();
		}
	}
}
