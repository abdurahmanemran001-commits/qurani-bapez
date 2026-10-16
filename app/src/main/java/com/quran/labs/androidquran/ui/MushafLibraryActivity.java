package com.quran.labs.androidquran.ui;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.KeyEvent;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Pattern;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * Mushaf & Qira'at library. Hosts the web mushaf viewer (bundled in assets/mushaf) inside a WebView.
 * Large mushafs (page images / text riwayat) are NOT in the APK: they are downloaded on demand into
 * filesDir/packs/&lt;dir&gt; and served to the page through a fake https://app.local origin.
 */
public class MushafLibraryActivity extends AppCompatActivity {
  private static final String HOST = "app.local";
  private static final String PACK_BASE =
      "https://abdurahmanemran001-commits.github.io/qurani-bapez/mushaf/data/";
  private static final Set<String> DIRS = new HashSet<>(Arrays.asList(
      "warshimg", "shubaimg", "qaloonimg", "qunbul", "bazzi", "douri", "susi"));
  private static final Pattern SAFE_NAME = Pattern.compile("^[A-Za-z0-9_][A-Za-z0-9_./-]*$");

  // downloads keep running if the user leaves the screen; progress is re-attached on return
  private static final Map<String, int[]> ACTIVE = new ConcurrentHashMap<>();
  private static final Map<String, AtomicBoolean> CANCEL = new ConcurrentHashMap<>();
  private static volatile MushafLibraryActivity current;
  private static final OkHttpClient CLIENT = new OkHttpClient.Builder()
      .connectTimeout(20, TimeUnit.SECONDS).readTimeout(30, TimeUnit.SECONDS).build();

  private WebView web;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    web = new WebView(this);
    setContentView(web);
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setAllowFileAccess(false);
    if (Build.VERSION.SDK_INT >= 17) {
      s.setMediaPlaybackRequiresUserGesture(false);
    }
    web.addJavascriptInterface(new Bridge(), "QPK");
    web.setWebViewClient(new WebViewClient() {
      @Override
      public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
        return serve(url);
      }

      @Override
      public boolean shouldOverrideUrlLoading(WebView view, String url) {
        Uri u = Uri.parse(url);
        if (HOST.equals(u.getHost())) {
          return false;
        }
        try {
          startActivity(new Intent(Intent.ACTION_VIEW, u));
        } catch (Exception ignored) {
        }
        return true;
      }
    });
    current = this;
    web.loadUrl("https://" + HOST + "/mushaf/index.html");
  }

  @Override
  protected void onDestroy() {
    if (current == this) {
      current = null;
    }
    if (web != null) {
      web.destroy();
    }
    super.onDestroy();
  }

  @Override
  public boolean onKeyDown(int keyCode, KeyEvent event) {
    if (keyCode == KeyEvent.KEYCODE_BACK && web != null && web.canGoBack()) {
      web.goBack();
      return true;
    }
    return super.onKeyDown(keyCode, event);
  }

  // ---------- serving files to the page ----------

  private WebResourceResponse serve(String url) {
    Uri u = Uri.parse(url);
    if (!HOST.equals(u.getHost())) {
      return null;
    }
    String path = u.getPath() == null ? "" : u.getPath();
    if (path.contains("..")) {
      return notFound();
    }
    try {
      InputStream in;
      if (path.startsWith("/packs/")) {
        File f = new File(getFilesDir(), path.substring(1));
        if (!f.isFile()) {
          return notFound();
        }
        in = new FileInputStream(f);
      } else if (path.startsWith("/mushaf/data/qcf4/")) {
        in = getAssets().open("qcf4/" + path.substring("/mushaf/data/qcf4/".length()));
      } else if (path.startsWith("/mushaf/data/tajweed/")) {
        in = getAssets().open("tajweed/" + path.substring("/mushaf/data/tajweed/".length()));
      } else if (path.startsWith("/mushaf/")) {
        in = getAssets().open("mushaf/" + path.substring("/mushaf/".length()));
      } else {
        return notFound();
      }
      return new WebResourceResponse(mime(path), mime(path).startsWith("text/") || path.endsWith(".json")
          || path.endsWith(".js") ? "UTF-8" : null, in);
    } catch (IOException e) {
      return notFound();
    }
  }

  private static WebResourceResponse notFound() {
    if (Build.VERSION.SDK_INT >= 21) {
      return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
          new java.util.HashMap<String, String>(), new ByteArrayInputStream(new byte[0]));
    }
    return new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream(new byte[0]));
  }

  private static String mime(String p) {
    String s = p.toLowerCase(Locale.US);
    if (s.endsWith(".html")) return "text/html";
    if (s.endsWith(".js")) return "application/javascript";
    if (s.endsWith(".json") || s.endsWith(".webmanifest")) return "application/json";
    if (s.endsWith(".css")) return "text/css";
    if (s.endsWith(".woff2")) return "font/woff2";
    if (s.endsWith(".woff")) return "font/woff";
    if (s.endsWith(".ttf")) return "font/ttf";
    if (s.endsWith(".otf")) return "font/otf";
    if (s.endsWith(".webp")) return "image/webp";
    if (s.endsWith(".png")) return "image/png";
    if (s.endsWith(".jpg") || s.endsWith(".jpeg")) return "image/jpeg";
    if (s.endsWith(".svg")) return "image/svg+xml";
    return "application/octet-stream";
  }

  // ---------- download packs ----------

  private File packDir(String dir) {
    return new File(new File(getApplicationContext().getFilesDir(), "packs"), dir);
  }

  private static void deleteRecursive(File f) {
    if (f.isDirectory()) {
      File[] c = f.listFiles();
      if (c != null) {
        for (File x : c) {
          deleteRecursive(x);
        }
      }
    }
    f.delete();
  }

  private static void notifyJs(final String dir, final int done, final int total, final String st) {
    final MushafLibraryActivity a = current;
    if (a == null || a.web == null) {
      return;
    }
    final String js = "window.__pk&&window.__pk('" + dir + "'," + done + "," + total + ",'" + st + "')";
    a.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        if (a.web == null) {
          return;
        }
        if (Build.VERSION.SDK_INT >= 19) {
          a.web.evaluateJavascript(js, null);
        } else {
          a.web.loadUrl("javascript:" + js);
        }
      }
    });
  }

  private void startDownload(final String dir, final List<String> files) {
    if (ACTIVE.containsKey(dir)) {
      return;
    }
    final int total = files.size();
    final AtomicBoolean cancel = new AtomicBoolean(false);
    final AtomicBoolean failed = new AtomicBoolean(false);
    final AtomicInteger done = new AtomicInteger(0);
    final File root = packDir(dir);
    ACTIVE.put(dir, new int[] {0, total});
    CANCEL.put(dir, cancel);
    new Thread(new Runnable() {
      @Override
      public void run() {
        deleteRecursive(root);
        root.mkdirs();
        ExecutorService ex = Executors.newFixedThreadPool(4);
        for (final String name : files) {
          ex.submit(new Runnable() {
            @Override
            public void run() {
              if (cancel.get() || failed.get()) {
                return;
              }
              boolean ok = false;
              for (int t = 0; t < 3 && !ok && !cancel.get(); t++) {
                ok = fetch(PACK_BASE + dir + "/" + name, new File(root, name));
                if (!ok) {
                  try {
                    Thread.sleep(700);
                  } catch (InterruptedException ignored) {
                  }
                }
              }
              if (!ok && !cancel.get()) {
                failed.set(true);
                return;
              }
              int d = done.incrementAndGet();
              ACTIVE.put(dir, new int[] {d, total});
              if (d % 6 == 0 || d == total) {
                notifyJs(dir, d, total, "progress");
              }
            }
          });
        }
        ex.shutdown();
        try {
          ex.awaitTermination(2, TimeUnit.HOURS);
        } catch (InterruptedException ignored) {
        }
        String st;
        if (cancel.get()) {
          deleteRecursive(root);
          st = "cancel";
        } else if (failed.get() || done.get() < total) {
          deleteRecursive(root);
          st = "error";
        } else {
          try {
            new File(root, "DONE").createNewFile();
            st = "done";
          } catch (IOException e) {
            deleteRecursive(root);
            st = "error";
          }
        }
        ACTIVE.remove(dir);
        CANCEL.remove(dir);
        notifyJs(dir, done.get(), total, st);
      }
    }).start();
  }

  private static boolean fetch(String url, File dest) {
    File tmp = new File(dest.getPath() + ".part");
    try {
      File parent = dest.getParentFile();
      if (parent != null) {
        parent.mkdirs();
      }
      Response r = CLIENT.newCall(new Request.Builder().url(url).build()).execute();
      try {
        if (!r.isSuccessful() || r.body() == null) {
          return false;
        }
        InputStream in = r.body().byteStream();
        OutputStream out = new FileOutputStream(tmp);
        try {
          byte[] buf = new byte[16384];
          int n;
          while ((n = in.read(buf)) > 0) {
            out.write(buf, 0, n);
          }
        } finally {
          out.close();
          in.close();
        }
      } finally {
        r.close();
      }
      if (tmp.length() == 0) {
        tmp.delete();
        return false;
      }
      return tmp.renameTo(dest);
    } catch (Exception e) {
      tmp.delete();
      return false;
    }
  }

  /** Methods callable from the page (window.QPK). Only whitelisted pack folders are accepted. */
  private class Bridge {
    @JavascriptInterface
    public boolean has(String dir) {
      return DIRS.contains(dir) && new File(packDir(dir), "DONE").exists();
    }

    @JavascriptInterface
    public String active(String dir) {
      int[] a = ACTIVE.get(dir);
      return a == null ? "" : a[0] + "/" + a[1];
    }

    @JavascriptInterface
    public void download(String dir, String filesJson) {
      if (!DIRS.contains(dir)) {
        return;
      }
      try {
        JSONArray arr = new JSONArray(filesJson);
        List<String> files = new ArrayList<>();
        for (int i = 0; i < arr.length() && i < 2000; i++) {
          String n = arr.getString(i);
          if (!SAFE_NAME.matcher(n).matches() || n.contains("..")) {
            return;
          }
          files.add(n);
        }
        if (!files.isEmpty()) {
          startDownload(dir, files);
        }
      } catch (Exception ignored) {
      }
    }

    @JavascriptInterface
    public void cancel(String dir) {
      AtomicBoolean c = CANCEL.get(dir);
      if (c != null) {
        c.set(true);
      }
    }

    @JavascriptInterface
    public void remove(String dir) {
      if (DIRS.contains(dir) && !ACTIVE.containsKey(dir)) {
        deleteRecursive(packDir(dir));
      }
    }

    @JavascriptInterface
    public void close() {
      runOnUiThread(new Runnable() {
        @Override
        public void run() {
          finish();
        }
      });
    }
  }
}
