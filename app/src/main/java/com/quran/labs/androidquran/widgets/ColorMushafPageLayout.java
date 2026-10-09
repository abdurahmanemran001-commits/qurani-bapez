package com.quran.labs.androidquran.widgets;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Color;
import android.os.Handler;
import android.preference.PreferenceManager;
import android.graphics.RectF;
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
import java.util.Set;

public class ColorMushafPageLayout extends FrameLayout {
  private final WebView webView;
  private final Handler handler = new Handler();
  // parsed once and shared by every page view
  private static final Map<String, String> tajweedAyahs = new HashMap<>();

  private final Map<String, RectF> ayahRects = new HashMap<>();
  private AyahClickListener ayahClickListener;
  private int page;
  private int activeSura = -1;
  private int activeAyah = -1;
  private boolean dataLoaded;

  public interface AyahClickListener {
    void onAyahClicked(SuraAyah suraAyah);

    void onAyahLongPressed(SuraAyah suraAyah);
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
    webView.setLongClickable(false);
    webView.setHapticFeedbackEnabled(false);
    webView.setOnLongClickListener(v -> true);
    webView.addJavascriptInterface(new Bridge(), "QuranBridge");
    webView.setWebViewClient(new WebViewClient() {
      @Override
      @SuppressWarnings("deprecation")
      public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, String url) {
        if (url != null && url.startsWith("https://qcf.local/")) {
          String name = url.substring("https://qcf.local/".length());
          int q = name.indexOf('?');
          if (q >= 0) name = name.substring(0, q);
          if (name.contains("..")) return null;
          try {
            InputStream in = getContext().getAssets().open("qcf4/" + name);
            return new android.webkit.WebResourceResponse(
                name.endsWith(".woff2") ? "font/woff2" : "application/octet-stream", null, in);
          } catch (Exception e) {
            return null;
          }
        }
        return super.shouldInterceptRequest(view, url);
      }

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
    pageHtml = readPageLayout();
    if (pageHtml != null || dataLoaded) {
      loadPage();
    } else {
      webView.loadDataWithBaseURL(null,
          "<html dir=\"rtl\"><body style=\"font-family:sans-serif;padding:24px;color:#8a1c1c\">"
              + "Tajweed data could not be loaded. Turn off Tajweed Color Mushaf in Settings "
              + "or reinstall the app.</body></html>",
          "text/html", "UTF-8", null);
    }
  }

  private String pageHtml;

  private boolean qcf;

  private String readAsset(String path) {
    InputStream in = null;
    try {
      in = getContext().getAssets().open(path);
      java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
      byte[] buf = new byte[8192];
      int n;
      while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
      return out.toString("UTF-8");
    } catch (Exception e) {
      return null;
    } finally {
      try { if (in != null) in.close(); } catch (Exception ignored) { }
    }
  }

  private String readPageLayout() {
    qcf = false;
    if (PreferenceManager.getDefaultSharedPreferences(getContext())
        .getBoolean("qcf4Pages", true)) {
      String fragment = readAsset(String.format(java.util.Locale.US, "qcf4/pages/%03d.html", page));
      if (fragment != null) {
        qcf = true;
        return fragment;
      }
    }
    if (!PreferenceManager.getDefaultSharedPreferences(getContext())
        .getBoolean("tajweedPageLayout", true)) {
      return null;
    }
    InputStream in = null;
    try {
      in = getContext().getAssets().open(String.format(java.util.Locale.US,
          "tajweed/pages/%03d.html", page));
      java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
      byte[] buf = new byte[8192];
      int n;
      while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
      return out.toString("UTF-8");
    } catch (Exception e) {
      return null;
    } finally {
      try { if (in != null) in.close(); } catch (Exception ignored) { }
    }
  }

  private void loadTajweedData(Context context) {
    synchronized (tajweedAyahs) {
      if (tajweedAyahs.size() >= 6000) {
        dataLoaded = true;
        return;
      }
    }
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
    if (pageHtml != null) {
      versesHtml.append(pageHtml);
    }
    SuraAyahIterator iterator = new SuraAyahIterator(start, end);
    while (pageHtml == null && iterator.next()) {
      int sura = iterator.getSura();
      int ayah = iterator.getAyah();
      String key = sura + ":" + ayah;
      String verseHtml = tajweedAyahs.get(key);
      if (verseHtml == null) continue;

      versesHtml.append("<div class=\"ayah\" data-sura=\"")
          .append(sura).append("\" data-ayah=\"").append(ayah)
          .append("\" onclick=\"tapAyah(this)\">")
          .append("<span class=\"ayahText\">")
          .append(verseHtml)
          .append("</span>")
          .append("<span class=\"ayahNumber\">")
          .append(ayah)
          .append("</span>")
          .append("</div>");
    }

    final String PAGE_CSS =
        "body.pg{padding:6px 6px 24px;background:#fffdf5;}" +
        ".pg .line{display:flex;justify-content:space-between;align-items:center;white-space:nowrap;" +
        "direction:rtl;gap:.25em;font-size:30px;line-height:1.95;padding:0 4px;overflow:hidden;}" +
        ".pg .line.c{justify-content:center;gap:.35em;}" +
        ".pg .line.hd{justify-content:center;font-size:24px;color:#6f5720;background:#f1e6c4;" +
        "border:1px solid #b99a4b;border-radius:8px;margin:4px 0;line-height:1.7;}" +
        ".pg .line.bs{justify-content:center;font-size:27px;}" +
        ".pg .ayah{display:inline-block;margin:0;padding:0;border:0;border-radius:6px;background:none;" +
        "box-shadow:none;}" +
        ".pg .ayah.audioActive{background:rgba(183,228,208,.7);box-shadow:none;}" +
        ".pg .ayah.selected{background:rgba(255,213,79,.55);}" +
        ".pg span.end{min-width:1.1em;height:1.1em;line-height:1.1em;font-size:.55em;margin:0 .15em;}";
    String qcfCss = "";
    String qcfJs = "";
    if (qcf) {
      String css = readAsset("qcf4/qcf.css");
      String js = readAsset("qcf4/qcf.js");
      if (css == null || js == null) {
        qcf = false;
      } else {
        qcfCss = "@font-face{font-family:PG;src:url('https://qcf.local/fonts/p" + page + ".woff2');}"
            + "@font-face{font-family:QCF4_QBSML;src:url('https://qcf.local/fonts/QCF4_QBSML.woff2');}"
            + "@font-face{font-family:BSM;src:url('https://qcf.local/fonts/QCF4_Hafs_01_W.woff2');}"
            + ":root{--pf:PG;}" + css;
        qcfJs = js;
      }
    }
    String title = escapeHtml(QuranInfo.getSuraNameFromPage(getContext(), page));
    String html = "<!doctype html><html lang=\"ar\" dir=\"rtl\"><head>" +
        "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">" +
        "<style>" +
        "@font-face{font-family:Noorehira;src:url('file:///android_asset/tajweed/noorehira.ttf');}" +
        "html,body{margin:0;padding:0;background:#fff;color:#173f35;}" +
        "*{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;}" +
        "body{font-family:Noorehira,'Noto Naskh Arabic',serif;padding:18px 12px 40px;box-sizing:border-box;}" +
        ".pageTitle{text-align:center;font-family:serif;font-size:18px;color:#6f5720;margin:4px 0 18px;}" +
        ".ayah{position:relative;margin:0 0 10px;padding:12px 16px 14px;border-radius:14px;" +
        "background:#fff;border:1px solid rgba(23,63,53,.10);box-shadow:0 2px 8px rgba(0,0,0,.035);" +
        "cursor:pointer;transition:background .18s ease,box-shadow .18s ease;}" +
        ".ayahText{font-size:29px;line-height:2.05;text-align:justify;display:block;}" +
        ".ayahNumber{display:none;}" +
        "span.end{display:inline-block;min-width:26px;height:26px;line-height:26px;text-align:center;" +
        "border:1px solid #b99a4b;border-radius:50%;font-size:16px;color:#6f5720;margin:0 6px;}" +
        "tajweed.ham_wasl,tajweed.slnt,tajweed.laam_shamsiyah{color:#aaaaaa;}" +
        "tajweed.madda_normal{color:#537fff;}" +
        "tajweed.madda_permissible{color:#4050ff;}" +
        "tajweed.madda_necessary{color:#000ebc;}" +
        "tajweed.madda_obligatory{color:#2144c1;}" +
        "tajweed.qalaqah{color:#dd0008;}" +
        "tajweed.ikhafa_shafawi{color:#d500b7;}" +
        "tajweed.ikhafa{color:#9400a8;}" +
        "tajweed.iqlab{color:#26bffd;}" +
        "tajweed.idgham_shafawi{color:#58b800;}" +
        "tajweed.idgham_ghunnah,tajweed.idgham_wo_ghunnah{color:#169200;}" +
        "tajweed.idgham_mutajanisayn,tajweed.idgham_mutaqaribayn{color:#a1a1a1;}" +
        "tajweed.ghunnah{color:#ff7e1e;}" +
        ".ayah.audioActive{background:rgba(183,228,208,.52);box-shadow:0 3px 14px rgba(23,63,53,.12);}" +
        ".ayah.selected{background:rgba(255,213,79,.45);}" +
        "" + (pageHtml != null ? PAGE_CSS : "") + qcfCss + "</style></head><body class=\"" + (pageHtml != null ? (qcf ? "pg q" : "pg") : "") + "\"" + (qcf ? " style=\"visibility:hidden\"" : "") + ">" +
        (pageHtml != null ? "" : "<div class=\"pageTitle\">" + title + " · " + page + "</div>") +
        versesHtml +
        "<script>" + qcfJs +
        "window.highlightAyah=function(s,a){window.clearAudioHighlight();var l=document.querySelectorAll('.ayah[data-sura=\\\"'+s+'\\\"][data-ayah=\\\"'+a+'\\\"]');" +
        "l.forEach(function(e){e.classList.add('audioActive');});if(l.length){l[0].scrollIntoView({behavior:'smooth',block:'center'});}};" +
        "window.clearAudioHighlight=function(){document.querySelectorAll('.ayah.audioActive').forEach(function(e){e.classList.remove('audioActive');});};" +
        "var lp=null,lpFired=false,sx=0,sy=0;" +
        "function ayahOf(t){while(t&&!(t.classList&&t.classList.contains('ayah')))t=t.parentNode;return t;}" +
        "function rectOf(e){var r=e.getBoundingClientRect(),d=window.devicePixelRatio||1;" +
        "return [r.left*d,r.top*d,r.right*d,r.bottom*d].join(',');}" +
        "window.tapAyah=function(e){if(lpFired){lpFired=false;return;}QuranBridge.ayah(e.dataset.sura,e.dataset.ayah);};" +
        "document.addEventListener('touchstart',function(ev){var e=ayahOf(ev.target);lpFired=false;if(!e)return;" +
        "var t=ev.touches[0];sx=t.clientX;sy=t.clientY;clearTimeout(lp);" +
        "lp=setTimeout(function(){lpFired=true;var r=e.getBoundingClientRect(),d=window.devicePixelRatio||1;" +
        "QuranBridge.longPress(e.dataset.sura,e.dataset.ayah,rectOf(e));},450);},{passive:true});" +
        "document.addEventListener('touchmove',function(ev){var t=ev.touches[0];" +
        "if(Math.abs(t.clientX-sx)>10||Math.abs(t.clientY-sy)>10){clearTimeout(lp);}},{passive:true});" +
        "document.addEventListener('touchend',function(){clearTimeout(lp);},{passive:true});" +
        "document.addEventListener('contextmenu',function(ev){ev.preventDefault();});" +
        "window.selectAyat=function(keys){window.clearSelection();keys.forEach(function(k){var p=k.split(':');" +
        "document.querySelectorAll('.ayah[data-sura=\\\"'+p[0]+'\\\"][data-ayah=\\\"'+p[1]+'\\\"]').forEach(function(e){e.classList.add('selected');});});};" +
        "window.clearSelection=function(){document.querySelectorAll('.ayah.selected').forEach(function(e){e.classList.remove('selected');});};" +
        "window.revealAyah=function(s,a){var e=document.querySelector('.ayah[data-sura=\\\"'+s+'\\\"][data-ayah=\\\"'+a+'\\\"]');" +
        "if(e){var r=e.getBoundingClientRect();if(r.top<0||r.bottom>window.innerHeight){e.scrollIntoView({block:'center'});}}};" +
        "if(document.body.classList.contains('pg')){document.addEventListener('click',function(ev){var e=ayahOf(ev.target);if(e)tapAyah(e);});" +
        "var fit=function(){var ls=[].slice.call(document.querySelectorAll('.line:not(.hd):not(.bs)'));var w=document.body.clientWidth-20;" +
        "var best=34;ls.forEach(function(l){if(l.classList.contains('c'))return;l.style.fontSize='34px';l.style.justifyContent='flex-start';" +
        "var sw=0;[].forEach.call(l.children,function(c){sw+=c.getBoundingClientRect().width;});sw+=(l.children.length-1)*8.5;var fs=34*w/(sw+0.0001);if(fs<best)best=fs;});" +
        "ls.forEach(function(l){l.style.fontSize=Math.min(best,34)+'px';l.style.justifyContent='';});};" +
        "if(document.body.classList.contains('q')){qinit();}else if(document.fonts&&document.fonts.ready){document.fonts.ready.then(fit);}else{window.onload=fit;}}" +
        "</script></body></html>";

    webView.loadDataWithBaseURL(qcf ? "https://qcf.local/" : "file:///android_asset/tajweed/",
        html, "text/html", "UTF-8", null);
  }

  public void highlightAyah(final int sura, final int ayah) {
    activeSura = sura;
    activeAyah = ayah;
    runJs("highlightAyah(" + sura + "," + ayah + ");");
  }

  public void selectAyat(Set<String> keys) {
    StringBuilder sb = new StringBuilder("[");
    boolean first = true;
    for (String key : keys) {
      if (!key.matches("\\d+:\\d+")) continue;
      if (!first) sb.append(',');
      sb.append('"').append(key).append('"');
      first = false;
    }
    sb.append(']');
    runJs("selectAyat(" + sb + ");");
  }

  public void clearSelection() {
    runJs("clearSelection();");
  }

  public void revealAyah(int sura, int ayah) {
    runJs("revealAyah(" + sura + "," + ayah + ");");
  }

  public AyahToolBar.AyahToolBarPosition getToolBarPosition(int sura, int ayah,
                                                            int toolBarWidth, int toolBarHeight) {
    final int width = getWidth();
    final int height = getHeight();
    if (width <= 0) return null;
    RectF rect = ayahRects.get(sura + ":" + ayah);
    if (rect == null) {
      // no touch position known (e.g. next/previous ayah): center of the page
      rect = new RectF(width / 4f, height / 3f, width * 3 / 4f, height / 3f + toolBarHeight);
    }
    boolean under = false;
    float y = rect.top - toolBarHeight;
    if (y < toolBarHeight) {
      y = Math.min(rect.bottom, height - toolBarHeight);
      under = true;
    }
    float mid = rect.centerX();
    float x = mid - toolBarWidth / 2f;
    if (x < 0) x = 0;
    if (x + toolBarWidth > width) x = width - toolBarWidth;
    AyahToolBar.AyahToolBarPosition pos = new AyahToolBar.AyahToolBarPosition();
    pos.x = x;
    pos.y = y;
    pos.pipOffset = Math.max(0, Math.min(toolBarWidth, mid - x));
    pos.pipPosition = under ? AyahToolBar.PipPosition.UP : AyahToolBar.PipPosition.DOWN;
    return pos;
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
    public void longPress(String sura, String ayah, String rect) {
      try {
        final int s = Integer.parseInt(sura);
        final int a = Integer.parseInt(ayah);
        String[] p = rect.split(",");
        final RectF r = new RectF(Float.parseFloat(p[0]), Float.parseFloat(p[1]),
            Float.parseFloat(p[2]), Float.parseFloat(p[3]));
        handler.post(() -> {
          ayahRects.put(s + ":" + a, r);
          if (ayahClickListener != null) {
            ayahClickListener.onAyahLongPressed(new SuraAyah(s, a));
          }
        });
      } catch (Exception ignored) {
      }
    }

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
