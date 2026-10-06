package com.quran.labs.androidquran.widgets;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Color;
import android.os.Handler;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import com.quran.labs.androidquran.data.SuraAyah;

public class ColorMushafPageLayout extends FrameLayout {
  private static final String[] PAGE_SOURCES = {
      "https://cdn.quran.ws/svg/pages/v1.1.1/hafs-kfqc/%03d.svg",
      "https://cdn.jsdelivr.net/gh/quran-ws/quran-svg@v1.1.1/mushafs/hafs/kfqc/svg/%03d.svg",
      "https://raw.githubusercontent.com/quran-ws/quran-svg/v1.1.1/mushafs/hafs/kfqc/svg/%03d.svg"
  };

  private final WebView webView;
  private final Handler handler = new Handler();
  private AyahClickListener ayahClickListener;
  private int page;
  private int sourceIndex;
  private int activeSura = -1;
  private int activeAyah = -1;
  private boolean pageReady;
  private ColorMushafPalette palette = ColorMushafPalette.forTheme(ColorMushafPalette.THEME_CLASSIC);
  private static String cssTemplate;
  private static String scriptSource;

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
        view.evaluateJavascript(
            "(document.querySelector('svg .ayahPolygon') ? 'ok' : 'bad')",
            result -> {
              if (!"\"ok\"".equals(result)) {
                if (sourceIndex + 1 < PAGE_SOURCES.length) {
                  sourceIndex++;
                  loadCurrentSource();
                }
                return;
              }
              pageReady = true;
              if (activeSura >= 0) {
                webView.evaluateJavascript("window._quranActiveSura=" + activeSura
                    + ";window._quranActiveAyah=" + activeAyah + ";", null);
              }
              installStyleAndTouchLayer();
            });
      }
    });
    addView(webView, new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
  }

  public void setAyahClickListener(AyahClickListener listener) {
    ayahClickListener = listener;
  }

  public void setPage(int page) {
    this.page = page;
    this.sourceIndex = 0;
    loadCurrentSource();
  }

  private void loadCurrentSource() {
    pageReady = false;
    webView.loadUrl(String.format(PAGE_SOURCES[sourceIndex], page));
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

  public void applyPalette(ColorMushafPalette newPalette) {
    palette = newPalette;
    setBackgroundColor(palette.background);
    webView.setBackgroundColor(palette.background);
    if (pageReady) {
      installStyleAndTouchLayer();
    }
  }

  private static String readAsset(Context context, String name) {
    InputStream in = null;
    try {
      in = context.getAssets().open(name);
      ByteArrayOutputStream out = new ByteArrayOutputStream();
      byte[] buffer = new byte[4096];
      int read;
      while ((read = in.read(buffer)) != -1) {
        out.write(buffer, 0, read);
      }
      return out.toString("UTF-8");
    } catch (IOException e) {
      return "";
    } finally {
      if (in != null) {
        try {
          in.close();
        } catch (IOException ignored) {
        }
      }
    }
  }

  private static String quote(String value) {
    return "'" + value.replace("\\", "\\\\").replace("'", "\\'")
        .replace("\n", "\\n").replace("\r", "") + "'";
  }

  private void installStyleAndTouchLayer() {
    if (cssTemplate == null) {
      cssTemplate = readAsset(getContext(), "color_mushaf.css");
      scriptSource = readAsset(getContext(), "color_mushaf.js");
    }
    if (scriptSource.isEmpty()) {
      return;
    }
    final String css = palette.buildCss(cssTemplate);
    webView.evaluateJavascript("(" + scriptSource.trim() + ")(" + quote(css) + ")", null);
  }

  private void runJs(final String js) {
    if (!pageReady) return;
    webView.evaluateJavascript(js, null);
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
