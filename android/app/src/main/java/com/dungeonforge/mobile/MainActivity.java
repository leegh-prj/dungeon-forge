package com.dungeonforge.mobile;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.webkit.WebViewAssetLoader;

public class MainActivity extends Activity {
 private static final String TAG="DungeonForgeQA";
 private static final String APP_URL="https://appassets.androidplatform.net/assets/index.html";
 private WebView web;
 private LinearLayout errorPanel;
 private TextView errorText;

 private void showLoadError(String detail) {
  Log.e(TAG, detail);
  runOnUiThread(() -> {
   if(errorPanel!=null && errorText!=null){
    errorText.setText("게임 파일을 불러오지 못했습니다.\n" + detail + "\n저장 데이터를 삭제하지 않고 다시 시도할 수 있습니다.");
    errorPanel.setVisibility(View.VISIBLE);
   }
  });
 }
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
    @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
      return loader.shouldInterceptRequest(request.getUrl());
    }
    @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
      if(request.isForMainFrame()) showLoadError("메인 화면 오류: " + error.getDescription());
    }
    @Override public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
      if(request.isForMainFrame()) showLoadError("게임 화면 HTTP " + response.getStatusCode());
    }
    @Override public void onPageFinished(WebView view,String url) {
      if(!APP_URL.equals(url))return;
      view.evaluateJavascript("(function(){return !!document.querySelector('#screen') && !document.querySelector('#gameErrorDetail')})()", result -> {
        if(!"true".equals(result))showLoadError("초기 게임 화면 검사 실패");
      });
    }
  });
  web.setWebChromeClient(new WebChromeClient() {
    @Override public boolean onConsoleMessage(ConsoleMessage message) {
      if(message.messageLevel()==ConsoleMessage.MessageLevel.ERROR)
        Log.e(TAG,"JS "+message.sourceId()+":"+message.lineNumber()+" "+message.message());
      return false;
    }
  });
  LinearLayout root=new LinearLayout(this);
  root.setOrientation(LinearLayout.VERTICAL);
  root.setBackgroundColor(0xFF111722);
  root.addView(web,new LinearLayout.LayoutParams(-1,0,1));
  errorPanel=new LinearLayout(this);
  errorPanel.setOrientation(LinearLayout.VERTICAL);
  errorPanel.setPadding(24,20,24,24);
  errorPanel.setBackgroundColor(0xFF281C1C);
  errorPanel.setVisibility(View.GONE);
  errorText=new TextView(this);
  errorText.setTextColor(0xFFFFFFFF);
  errorText.setTextSize(14);
  errorPanel.addView(errorText);
  Button retry=new Button(this);
  retry.setText("다시 불러오기");
  retry.setOnClickListener(v -> {
    errorPanel.setVisibility(View.GONE);
    web.loadUrl(APP_URL);
  });
  errorPanel.addView(retry);
  root.addView(errorPanel,new LinearLayout.LayoutParams(-1,-2));
  setContentView(root);
  web.loadUrl(APP_URL);
 }
 @Override public void onBackPressed() {
   if(web!=null&&web.canGoBack())web.goBack();else super.onBackPressed();
 }
 @Override protected void onDestroy(){if(web!=null){web.destroy();web=null;}super.onDestroy();}
}
