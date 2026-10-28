package com.dungeonforge.mobile;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.view.View;
import android.content.res.Configuration;
public class MainActivity extends Activity {
 private WebView web;
 @Override public void onCreate(Bundle b){
  super.onCreate(b);
  getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN|View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
  web=new WebView(this);web.setWebViewClient(new WebViewClient());web.setWebChromeClient(new WebChromeClient());
  WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);
  s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  setContentView(web);web.loadUrl("https://dungeon-forge-gilt.vercel.app/");
 }
 @Override public void onConfigurationChanged(Configuration c){super.onConfigurationChanged(c);}
 @Override public void onBackPressed(){if(web!=null&&web.canGoBack())web.goBack();else super.onBackPressed();}
 @Override protected void onDestroy(){if(web!=null)web.destroy();super.onDestroy();}
}