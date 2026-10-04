package com.quran.labs.androidquran.widgets;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Color;
import android.os.Handler;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import com.quran.labs.androidquran.data.SuraAyah;

public class ColorMushafPageLayout extends FrameLayout {
  private static final String CDN =
      "https://cdn.quran.ws/svg/pages/v1.1.1/hafs-kfqc/%03d.svg";

  private final WebView webView;
  private final Handler handler = new Handler();
  private AyahClickListener ayahClickListener;
  private int page;
  private int activeSura = -1;
  private int activeAyah = -1;

  public interface AyahClickListener {
    void onAyahClicked(SuraAyah suraAyah);
  }

  @SuppressLint("SetJavaScriptEnabled")
  public ColorMushafPageLayout(Context context) {
    super(context);
    setBackgroundColor(Color.WHITE);

    webView = new WebView(context);
    WebSettings settings = webView.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setBuiltInZoomControls(false);
    settings.setDisplayZoomControls(false);
    settings.setSupportZoom(false);
    settings.setLoadWithOverviewMode(true);
    settings.setUseWideViewPort(true);
    webView.setBackgroundColor(Color.WHITE);
    webView.setVerticalScrollBarEnabled(false);
    webView.setHorizontalScrollBarEnabled(false);
    webView.addJavascriptInterface(new Bridge(), "QuranBridge");
    webView.setWebViewClient(new WebViewClient() {
      @Override
      public void onPageFinished(WebView view, String url) {
        installStyleAndTouchLayer();
      }
    });
    addView(webView, new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
  }

  public void setAyahClickListener(AyahClickListener listener) {
    ayahClickListener = listener;
  }

  public void setPage(int page) {
    this.page = page;
    webView.loadUrl(String.format(CDN, page));
  }

  public void highlightAyah(final int sura, final int ayah) {
    activeSura = sura;
    activeAyah = ayah;
    runJs("window._quranActiveSura=" + sura + ";window._quranActiveAyah=" + ayah +
        ";highlightAyah(" + sura + "," + ayah + ");");
  }

  public void clearAudioHighlight() {
    activeSura = -1;
    activeAyah = -1;
    runJs("window._quranActiveSura=-1;window._quranActiveAyah=-1;clearAudioHighlight();");
  }

  private void installStyleAndTouchLayer() {
    final String js =
        "(function() {" +
        "var s=document.createElement('style');" +
        "s.innerHTML='html,body{margin:0;padding:0;background:#ffffff;overflow:hidden;}'" +
        " + 'svg{width:100vw;height:auto;display:block;}'" +
        " + '.ayahPolygon{fill:#173f35 !important;fill-opacity:0 !important;cursor:pointer;}'" +
        " + '.ayahPolygon.audioActive{fill:#b7e4d0 !important;fill-opacity:.55 !important;}'" +
        " + 'svg path:not(.ayahPolygon){fill:#173f35 !important;}'" +
        " + 'svg text{fill:#8a6b24 !important;}';" +
        "s.id='quranColorStyle';document.head.appendChild(s);" +
        "window.highlightAyah=function(s,a){clearAudioHighlight();var e=document.querySelector('.ayahPolygon[surah=\\\"'+s+'\\\"][ayah=\\\"'+a+'\\\"]');if(e)e.classList.add('audioActive');};" +
        "window.clearAudioHighlight=function(){document.querySelectorAll('.ayahPolygon.audioActive').forEach(function(e){e.classList.remove('audioActive');});}" +
        "document.querySelectorAll('.ayahPolygon').forEach(function(el){" +
        "el.style.pointerEvents='auto';" +
        "el.addEventListener('click',function(){" +
        "QuranBridge.ayah(" +
        "el.getAttribute('surah'),el.getAttribute('ayah'));});});" +
        "if(window._quranActiveSura>=0){highlightAyah(window._quranActiveSura,window._quranActiveAyah);}" +
        "})();";
    webView.evaluateJavascript("javascript:" + js, null);
  }

  private void runJs(final String js) {
    if (webView.getUrl() == null) return;
    webView.evaluateJavascript("javascript:" + js, null);
  }

  private class Bridge {
    @JavascriptInterface
    public void ayah(String sura, String ayah) {
      try {
        final SuraAyah result = new SuraAyah(Integer.parseInt(sura), Integer.parseInt(ayah));
        handler.post(() -> {
          if (ayahClickListener != null) ayahClickListener.onAyahClicked(result);
        });
      } catch (NumberFormatException ignored) {
      }
    }
  }
}
