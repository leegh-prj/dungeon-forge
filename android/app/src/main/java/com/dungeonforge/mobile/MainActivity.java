package com.dungeonforge.mobile;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Button;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.view.View;
import android.content.res.Configuration;
public class MainActivity extends Activity {
 private WebView web;
 private LinearLayout shell;
 private TextView errorNote;
 private static final String GAME_URL="https://dungeon-forge-gilt.vercel.app/";
 @Override public void onCreate(Bundle b){
  super.onCreate(b);
  getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN|View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
  web=new WebView(this);
  web.setWebViewClient(new WebViewClient(){
   @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error){
    if(request.isForMainFrame()){errorNote.setText("네트워크 연결을 확인한 후 다시 시도하세요. 저장 데이터는 삭제되지 않습니다.");errorNote.setVisibility(View.VISIBLE);}
   }
   @Override public void onPageFinished(WebView view,String url){if(url.startsWith(GAME_URL))errorNote.setVisibility(View.GONE);}
  });
  web.setWebChromeClient(new WebChromeClient());
  WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);
  s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  shell=new LinearLayout(this);shell.setOrientation(LinearLayout.VERTICAL);
  errorNote=new TextView(this);errorNote.setText("연결 중…");errorNote.setVisibility(View.GONE);errorNote.setPadding(18,12,18,12);
  shell.addView(errorNote,new LinearLayout.LayoutParams(-1,-2));
  Button retry=new Button(this);retry.setText("연결 다시 시도");retry.setOnClickListener(v->{errorNote.setVisibility(View.GONE);web.loadUrl(GAME_URL);});
  shell.addView(retry,new LinearLayout.LayoutParams(-1,-2));retry.setVisibility(View.GONE);
  errorNote.setOnClickListener(v->retry.setVisibility(View.VISIBLE));
  shell.addView(web,new LinearLayout.LayoutParams(-1,0,1));
  setContentView(shell);web.loadUrl(GAME_URL);
 }
 @Override public void onConfigurationChanged(Configuration c){super.onConfigurationChanged(c);}
 @Override public void onBackPressed(){if(web!=null&&web.canGoBack())web.goBack();else super.onBackPressed();}
 @Override protected void onDestroy(){if(web!=null)web.destroy();super.onDestroy();}
}