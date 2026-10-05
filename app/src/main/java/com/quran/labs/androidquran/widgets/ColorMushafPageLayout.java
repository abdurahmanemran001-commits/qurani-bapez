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

import com.quran.labs.androidquran.data.QuranInfo;
import com.quran.labs.androidquran.data.SuraAyah;
import com.quran.labs.androidquran.data.SuraAyahIterator;

import com.squareup.moshi.JsonReader;
import okio.Okio;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

public class ColorMushafPageLayout extends FrameLayout {
  private final WebView webView;
  private final Handler handler = new Handler();
  private final Map<String, String> tajweedAyahs = new HashMap<>();

  private AyahClickListener ayahClickListener;
  private int page;
  private int activeSura = -1;
  private int activeAyah = -1;
  private boolean dataLoaded;

  public interface AyahClickListener {
    void onAyahClicked(SuraAyah suraAyah);
  }

  @SuppressLint("SetJavaScriptEnabled")
  public ColorMushafPageLayout(Context context) {
    super(context);
    setBackgroundColor(Color.WHITE);
    loadTajweedData(context);

    webView = new WebView(context);
    WebSettings settings = webView.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setAllowFileAccess(true);
    settings.setBuiltInZoomControls(false);
    settings.setDisplayZoomControls(false);
    settings.setSupportZoom(false);
    settings.setLoadWithOverviewMode(false);
    settings.setUseWideViewPort(true);
    webView.setBackgroundColor(Color.WHITE);
    webView.setVerticalScrollBarEnabled(false);
    webView.setHorizontalScrollBarEnabled(false);
    webView.addJavascriptInterface(new Bridge(), "QuranBridge");
    webView.setWebViewClient(new WebViewClient() {
      @Override
      public void onPageFinished(WebView view, String url) {
        installStyleAndTouchLayer();
        if (activeSura >= 0) {
          highlightAyah(activeSura, activeAyah);
        }
      }
    });
    addView(webView, new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
  }

  public void setAyahClickListener(AyahClickListener listener) {
    ayahClickListener = listener;
  }

  public void setPage(int page) {
    this.page = page;
    if (dataLoaded) {
      loadPage();
    }
  }

  private void loadTajweedData(Context context) {
    InputStream input = null;
    JsonReader reader = null;
    try {
      input = context.getAssets().open("tajweed/tajweedquran.json");
      reader = JsonReader.of(Okio.buffer(Okio.source(input)));

      reader.beginObject();
      while (reader.hasNext()) {
        String name = reader.nextName();
        if (!"verses".equals(name)) {
          reader.skipValue();
          continue;
        }

        reader.beginArray();
        while (reader.hasNext()) {
          int sura = -1;
          int ayah = -1;
          String html = "";

          reader.beginObject();
          while (reader.hasNext()) {
            String field = reader.nextName();
            if ("surah".equals(field)) {
              sura = reader.nextInt();
            } else if ("ayah".equals(field)) {
              ayah = reader.nextInt();
            } else if ("text_tajweed_html".equals(field)) {
              html = reader.nextString();
            } else if ("text_ar".equals(field)) {
              if (html.length() == 0) {
                html = escapeHtml(reader.nextString());
              } else {
                reader.skipValue();
              }
            } else {
              reader.skipValue();
            }
          }
          reader.endObject();

          if (sura > 0 && ayah > 0 && html.length() > 0) {
            tajweedAyahs.put(sura + ":" + ayah, sanitizeVerseHtml(html));
          }
        }
        reader.endArray();
      }
      reader.endObject();

      dataLoaded = tajweedAyahs.size() >= 6000;
      if (dataLoaded && page > 0) {
        loadPage();
      }
    } catch (Exception e) {
      dataLoaded = false;
      tajweedAyahs.clear();
      android.util.Log.e("ColorMushaf", "Failed to load Tajweed Quran asset", e);
    } finally {
      try {
        if (reader != null) reader.close();
        else if (input != null) input.close();
      } catch (Exception ignored) {
      }
    }
  }

  private void loadPage() {
    int[] bounds = QuranInfo.getPageBounds(page);
    SuraAyah start = new SuraAyah(bounds[0], bounds[1]);
    SuraAyah end = new SuraAyah(bounds[2], bounds[3]);

    StringBuilder versesHtml = new StringBuilder();
    SuraAyahIterator iterator = new SuraAyahIterator(start, end);
    while (iterator.next()) {
      int sura = iterator.getSura();
      int ayah = iterator.getAyah();
      String key = sura + ":" + ayah;
      String verseHtml = tajweedAyahs.get(key);
      if (verseHtml == null) continue;

      versesHtml.append("<div class=\"ayah\" data-sura=\"")
          .append(sura).append("\" data-ayah=\"").append(ayah)
          .append("\" onclick=\"QuranBridge.ayah('")
          .append(sura).append("','").append(ayah).append("')\">")
          .append("<span class=\"ayahText\">")
          .append(verseHtml)
          .append("</span>")
          .append("<span class=\"ayahNumber\">")
          .append(ayah)
          .append("</span>")
          .append("</div>");
    }

    String title = escapeHtml(QuranInfo.getSuraNameFromPage(getContext(), page));
    String html = "<!doctype html><html lang=\"ar\" dir=\"rtl\"><head>" +
        "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">" +
        "<style>" +
        "@font-face{font-family:Noorehira;src:url('file:///android_asset/tajweed/noorehira.ttf');}" +
        "html,body{margin:0;padding:0;background:#fff;color:#173f35;}" +
        "body{font-family:Noorehira,serif;padding:18px 12px 40px;box-sizing:border-box;}" +
        ".pageTitle{text-align:center;font-family:serif;font-size:18px;color:#6f5720;margin:4px 0 18px;}" +
        ".ayah{position:relative;margin:0 0 10px;padding:12px 16px 14px;border-radius:14px;" +
        "background:#fff;border:1px solid rgba(23,63,53,.10);box-shadow:0 2px 8px rgba(0,0,0,.035);" +
        "cursor:pointer;transition:background .18s ease,box-shadow .18s ease;}" +
        ".ayahText{font-size:29px;line-height:2.05;text-align:justify;display:block;}" +
        ".ayahNumber{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;" +
        "border:1px solid #b99a4b;border-radius:50%;font:14px serif;color:#6f5720;margin:0 5px;vertical-align:middle;}" +
        ".ayah.audioActive{background:rgba(183,228,208,.52);box-shadow:0 3px 14px rgba(23,63,53,.12);}" +
        "</style></head><body>" +
        "<div class=\"pageTitle\">" + title + " · " + page + "</div>" +
        versesHtml +
        "<script>" +
        "window.highlightAyah=function(s,a){window.clearAudioHighlight();var e=document.querySelector('.ayah[data-sura=\\\"'+s+'\\\"][data-ayah=\\\"'+a+'\\\"]');" +
        "if(e){e.classList.add('audioActive');e.scrollIntoView({behavior:'smooth',block:'center'});}};" +
        "window.clearAudioHighlight=function(){document.querySelectorAll('.ayah.audioActive').forEach(function(e){e.classList.remove('audioActive');});};" +
        "</script></body></html>";

    webView.loadDataWithBaseURL("file:///android_asset/tajweed/", html, "text/html", "UTF-8", null);
  }

  public void highlightAyah(final int sura, final int ayah) {
    activeSura = sura;
    activeAyah = ayah;
    runJs("highlightAyah(" + sura + "," + ayah + ");");
  }

  public void clearAudioHighlight() {
    activeSura = -1;
    activeAyah = -1;
    runJs("clearAudioHighlight();");
  }

  private void installStyleAndTouchLayer() {
    if (activeSura >= 0) {
      runJs("highlightAyah(" + activeSura + "," + activeAyah + ");");
    }
  }

  private void runJs(final String js) {
    if (webView.getUrl() == null) return;
    webView.evaluateJavascript("javascript:" + js, null);
  }

  private String sanitizeVerseHtml(String html) {
    return html
        .replaceAll("(?is)<script[^>]*>.*?</script>", "")
        .replaceAll("(?is)<iframe[^>]*>.*?</iframe>", "")
        .replaceAll("(?i)\\s+on[a-z]+\\s*=\\s*(['\"]).*?\\1", "");
  }

  private String escapeHtml(String value) {
    return value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;");
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
