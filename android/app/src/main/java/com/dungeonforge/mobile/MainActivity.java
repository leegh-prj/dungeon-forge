package com.dungeonforge.mobile;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.view.View;
import androidx.webkit.WebViewAssetLoader;

public class MainActivity extends Activity {
 private WebView web;
 private static final String APP_URL="https://appassets.androidplatform.net/assets/index.html";
 @Override public void onCreate(Bundle state) {
  super.onCreate(state);
  getWindow().getDecorView().setSystemUiVisibility(
    View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
  web=new WebView(this);
  WebSettings settings=web.getSettings();
  settings.setJavaScriptEnabled(true);
  settings.setDomStorageEnabled(true);
  settings.setAllowFileAccess(false);
  settings.setAllowContentAccess(false);
  settings.setJavaScriptCanOpenWindowsAutomatically(false);
  settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  final WebViewAssetLoader loader=new WebViewAssetLoader.Builder()
    .addPathHandler("/assets/",new WebViewAssetLoader.AssetsPathHandler(this)).build();
  web.setWebViewClient(new WebViewClient() {
    @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request) {
      return loader.shouldInterceptRequest(request.getUrl());
    }
  });
  web.setWebChromeClient(new WebChromeClient());
  setContentView(web);
  web.loadUrl(APP_URL);
 }
 @Override public void onBackPressed() {
   if(web!=null&&web.canGoBack())web.goBack();else super.onBackPressed();
 }
 @Override protected void onDestroy(){if(web!=null){web.destroy();web=null;}super.onDestroy();}
}
